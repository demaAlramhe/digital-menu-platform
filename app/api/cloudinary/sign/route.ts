import { NextResponse } from "next/server";
import crypto from "crypto";
import { requireApiStoreOwnerOrSuperAdmin } from "@/lib/auth/api-auth";
import { parseJsonBody } from "@/lib/api/validation";
import { cloudinarySignSchema } from "@/lib/api/schemas";

/**
 * Build a Cloudinary authentication signature.
 * Sign every upload param except file / cloud_name / resource_type / api_key.
 * Params must be alphabetical key=value pairs, then API secret appended.
 * @see https://cloudinary.com/documentation/authentication_signatures
 */
function createCloudinarySignature(
  params: Record<string, string | number>,
  apiSecret: string
) {
  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return crypto
    .createHash("sha1")
    .update(`${toSign}${apiSecret}`)
    .digest("hex");
}

export async function POST(req: Request) {
  try {
    const auth = await requireApiStoreOwnerOrSuperAdmin();
    if (auth.errorResponse) {
      return auth.errorResponse;
    }

    const parsed = await parseJsonBody(req, cloudinarySignSchema);
    if (parsed.error) {
      return parsed.error;
    }

    const { folder } = parsed.data;
    const folderTrimmed = folder.trim();

    const timestamp = Math.floor(Date.now() / 1000);
    const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
    const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();

    if (!apiKey || !apiSecret || !cloudName) {
      return NextResponse.json(
        { error: "Missing Cloudinary environment variables." },
        { status: 500 }
      );
    }

    const signature = createCloudinarySignature(
      { folder: folderTrimmed, timestamp },
      apiSecret
    );

    return NextResponse.json({
      timestamp: String(timestamp),
      signature,
      apiKey,
      cloudName,
      folder: folderTrimmed,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate upload signature.", details: String(error) },
      { status: 500 }
    );
  }
}
