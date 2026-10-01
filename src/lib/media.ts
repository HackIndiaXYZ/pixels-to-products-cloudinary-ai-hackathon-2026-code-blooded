// Cloudinary delivery URLs. Pure functions — usable on server and client (cloud name is public).

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";
const base = (cloud: string) => `https://res.cloudinary.com/${cloud}/video/upload`;
const sec = (t: number) => Math.max(0, Math.round(t * 10) / 10);

// A content-aware 16:9 frame at a moment: g_auto keeps the speaker/slide in frame instead of a blind centre crop.
export function thumbUrl(publicId: string, atS: number, cloud = CLOUD): string {
  return `${base(cloud)}/so_${sec(atS)},c_fill,ar_16:9,w_640,g_auto/f_auto,q_auto/${publicId}.jpg`;
}
