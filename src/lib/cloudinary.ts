import "server-only";
import { v2 as cloudinary } from "cloudinary";

import { env } from "@/lib/env";

let configured = false;

export function cld() {
  if (!configured) {
    const e = env();
    cloudinary.config({
      cloud_name: e.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: e.NEXT_PUBLIC_CLOUDINARY_API_KEY,
      api_secret: e.CLOUDINARY_API_SECRET,
      secure: true,
    });
    configured = true;
  }
  return cloudinary;
}
