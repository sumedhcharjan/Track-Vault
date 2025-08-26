// import { NextResponse } from "next/server";
// import { redis } from "@/lib/redis";

// export async function GET() {
//   // 1. Set a value
//   await redis.set("greeting", "Hello Sumedh!");

//   // 2. Get it back
//   const value = await redis.get("greeting");

//   // 3. Increment a counter
//   const count = await redis.incr("test-counter");

//   return NextResponse.json({
//     message: value,
//     counter: count,
//   });
// }

import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "@/lib/s3";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Convert File → Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload params
    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `test/${Date.now()}-${file.name}`,
      Body: buffer,
      ContentType: file.type,
    };

    // Upload to S3
    await s3.send(new PutObjectCommand(uploadParams));

    return NextResponse.json({
      success: true,
      url: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`,
    });
  } catch (err) {
    console.error("S3 Upload Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
