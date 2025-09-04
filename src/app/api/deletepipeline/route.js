import { redis } from "@/lib/redis";
import { supabase } from "@/lib/supabase";
import { s3 } from "@/lib/s3";
import { NextResponse } from "next/server";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";




export async function DELETE(req) {
    try {
        const { file_id } = await req.json();

        if (!file_id) {
            return NextResponse.json(
                { success: false, error: "file_id is required" },
                { status: 400 }
            );
        }

        const { data: fileMeta, error: fetchError } = await supabase
            .from("files")
            .select("*")
            .eq("id", file_id)
            .single();

        if (fetchError || !fileMeta) {
            return NextResponse.json(
                { success: false, error: "File not found" },
                { status: 404 }
            );
        }


        try {
            await s3.send(
                new DeleteObjectCommand({
                    Bucket: process.env.AWS_S3_BUCKET,
                    Key: fileMeta.file_key,
                })
            );
            console.log("✅ S3 delete success:", fileMeta.file_key);
        } catch (s3Err) {
            console.error("❌ S3 delete error:", {
                message: s3Err.message,
                code: s3Err.name,
                stack: s3Err.stack,
                key: fileMeta.file_key,
            });
            return NextResponse.json(
                { success: false, error: "Failed to delete file from S3", details: s3Err.message },
                { status: 500 }
            );
        }


        const { error: updateError } = await supabase
            .from("files")
            .update({
                is_active: false,
                expires_at: new Date().toISOString(),
            })
            .eq("id", file_id);

        if (updateError) throw updateError;

        // await redis.del(`file:${file_id}:views`);
        // await redis.del(`file:${file_id}:downloads`);
        // await redis.del(`file:${file_id}:lastAccess`)

        return NextResponse.json({
            success: true,
            message: "File deleted from S3 and marked inactive in DB",
        });
    } catch (err) {
        console.error("Error in DELETE:", err);
        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500 }
        );
    }
}
