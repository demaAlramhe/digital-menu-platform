import { NextResponse } from "next/server";
import crypto from "crypto";
import { isAllowedCloudinaryFolder } from "@/lib/cloudinary/folders";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const folder = body.folder;

    if (!folder || typeof folder !== "string" || !isAllowedCloudinaryFolder(folder)) {
      return NextResponse.json(
        { error: "Invalid or missing Cloudinary upload folder." },
        { status: 400 }
      );
    }

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
