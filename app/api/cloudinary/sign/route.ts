import { NextResponse } from "next/server";
import crypto from "crypto";
import { requireApiStoreOwnerOrSuperAdmin } from "@/lib/auth/api-auth";
import { parseJsonBody } from "@/lib/api/validation";
import { cloudinarySignSchema } from "@/lib/api/schemas";

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

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

    if (!apiKey || !apiSecret || !cloudName) {
      return NextResponse.json(
        { error: "Missing Cloudinary environment variables." },
        { status: 500 }
      );
    }

    const paramsToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto
      .createHash("sha1")
      .update(paramsToSign)
      .digest("hex");

    return NextResponse.json({
      timestamp,
      signature,
      apiKey,
      cloudName,
      folder,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate upload signature.", details: String(error) },
      { status: 500 }
    );
  }
}
