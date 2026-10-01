// Local end-to-end run of the real pipeline against a running `pnpm dev`:
// sign in → create session → upload through the signed preset (like the widget) → wait for Cloudinary's AI →
// deliver a correctly signed webhook to localhost (Cloudinary can't reach localhost) → publish.
// Usage: node scripts/e2e-local.mjs "<title>" "<speaker>" <video file>
import "./env.mjs";
import { createHash } from "node:crypto";
import { v2 as cloudinary } from "cloudinary";

const APP = process.env.E2E_APP ?? "http://localhost:3000";
const [title, speaker, file] = process.argv.slice(2);
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const json = { "Content-Type": "application/json" };
const signin = await fetch(`${APP}/api/organizer/session`, { method: "POST", headers: json, body: JSON.stringify({ passcode: process.env.ORGANIZER_PASSCODE }) });
if (signin.status !== 204) throw new Error(`sign-in failed: ${signin.status}`);
const cookie = signin.headers.get("set-cookie").split(";")[0];
console.log("signed in");

const created = await fetch(`${APP}/api/lectures`, { method: "POST", headers: { ...json, cookie }, body: JSON.stringify({ title, speaker, rightsConfirmed: true }) });
const { lecture, uploadPreset } = await created.json();
console.log("created", lecture.id, lecture.publicId);

// Same signing path the browser widget uses.
const timestamp = Math.round(Date.now() / 1000);
const paramsToSign = { public_id: lecture.publicId, upload_preset: uploadPreset, timestamp, source: "uw" };
const signed = await fetch(`${APP}/api/upload-signature`, { method: "POST", headers: { ...json, cookie }, body: JSON.stringify({ paramsToSign }) });
const { signature } = await signed.json();
if (!signature) throw new Error(`signing failed: ${signed.status}`);
const uploaded = await cloudinary.uploader.upload(file, { resource_type: "video", ...paramsToSign, signature, api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY });
console.log("uploaded", uploaded.public_id, `${Math.round(uploaded.duration)}s`);

for (let i = 0; i < 30; i++) {
  await new Promise((r) => setTimeout(r, 5000));
  const r = await cloudinary.api.resource(lecture.publicId, { resource_type: "video" });
  if (r.info?.auto_transcription?.status === "complete" && r.info?.auto_chaptering?.status === "complete") break;
}

async function webhook(payload) {
  const body = JSON.stringify(payload);
  const ts = String(Math.round(Date.now() / 1000));
  const sig = createHash("sha1").update(body + ts + process.env.CLOUDINARY_API_SECRET).digest("hex");
  const res = await fetch(`${APP}/api/webhooks/cloudinary`, { method: "POST", headers: { ...json, "X-Cld-Timestamp": ts, "X-Cld-Signature": sig }, body });
  console.log(`webhook ${payload.info_kind ?? payload.notification_type}:`, res.status);
}
await webhook({ notification_type: "upload", public_id: lecture.publicId, duration: uploaded.duration });
await webhook({ notification_type: "info", info_kind: "auto_transcription", info_status: "complete", public_id: lecture.publicId });

const published = await fetch(`${APP}/api/lectures/${lecture.id}`, { method: "PATCH", headers: { ...json, cookie }, body: JSON.stringify({ visibility: "public" }) });
console.log("published:", published.status, (await published.json()).status);
