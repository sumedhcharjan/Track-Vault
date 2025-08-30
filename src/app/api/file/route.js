import { NextRequest, NextResponse } from "next/server";
import { s3 } from "@/lib/s3";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcrypt"



export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const userId = formData.get("user_id");
    const orignal_file_name = formData.get("file_name") // 👈 pass user id along with form-data

    if (!file || !userId) {
      return NextResponse.json({ error: "File and user_id required" }, { status: 400 });
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${uuidv4()}.${fileExt}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: fileName,
        Body: buffer,
        ContentType: file.type,
      })
    );

    const fileUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    const rawPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const { data, error } = await supabase
      .from("files")
      .insert([{
        user_id: userId,
        file_name: orignal_file_name,
        file_key: fileName,
        file_url: fileUrl,
        file_type: file.type,
        file_size: file.size,
        file_password: hashedPassword
      }])
      .select();


    if (error) throw error;

    return NextResponse.json({
      message: "File uploaded successfully",
      file: data[0],
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { file_id, file_key } = await req.json();


    if (!file_id) {
      return NextResponse.json({ error: "file_id required" }, { status: 400 });
    }


    // 2. Delete from S3
    await s3.send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: file_key,
      })
    );

    // 3. Delete from Supabase DB
    await supabase.from("files").delete().eq("id", file_id);

    // 4. Return success
    return NextResponse.json({ message: "File deleted", file_id }, { status: 200 });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
