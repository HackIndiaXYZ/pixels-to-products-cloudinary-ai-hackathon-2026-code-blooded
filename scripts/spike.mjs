// Phase 01 verification: proves the Cloudinary pipeline on a real upload (docs/phases/PHASE-01-cloudinary-spike.md).
// Usage: node scripts/spike.mjs <video file> <public_id>
import "./env.mjs";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const [file, publicId] = process.argv.slice(2);
const preset = process.env.CLOUDINARY_UPLOAD_PRESET ?? "pravaha_signed";

// 1. The signed upload preset carries the AI work, so browsers can't change it (docs/CLOUDINARY.md §3).
const presetSettings = {
  unsigned: false,
  allowed_formats: "mp4,mov,webm,mkv,m4v",
  auto_transcription: true,
  auto_chaptering: true,
  ...(process.env.APP_URL?.startsWith("https://") ? { notification_url: `${process.env.APP_URL}/api/webhooks/cloudinary` } : {}),
};
try {
  await cloudinary.api.upload_preset(preset);
  await cloudinary.api.update_upload_preset(preset, presetSettings);
  console.log(`updated preset ${preset}`);
} catch {
  await cloudinary.api.create_upload_preset({ name: preset, ...presetSettings });
  console.log(`created preset ${preset}`);
}
console.log("preset settings:", JSON.stringify((await cloudinary.api.upload_preset(preset)).settings));

if (!file) process.exit(0);

// 2. Upload through the preset, exactly as the Studio does.
const uploaded = await cloudinary.uploader.upload(file, { resource_type: "video", upload_preset: preset, public_id: publicId, overwrite: true });
console.log("uploaded:", JSON.stringify({ public_id: uploaded.public_id, duration: uploaded.duration, info: uploaded.info }));

// 3. Poll until the AI work finishes (dev only — the app uses the webhook).
for (let i = 0; i < 40; i++) {
  await new Promise((r) => setTimeout(r, 15000));
  const r = await cloudinary.api.resource(publicId, { resource_type: "video" });
  console.log(`t+${(i + 1) * 15}s info:`, JSON.stringify(r.info ?? {}));
  const states = Object.values(r.info ?? {}).map((v) => v?.status);
  if (states.length && states.every((s) => s && s !== "pending" && s !== "processing")) break;
}
