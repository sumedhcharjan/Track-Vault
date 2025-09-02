import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const data = await req.json();
        const { file_id, maxViews, maxDownloads, expiresAt, password } = data;

        const updateData = {};

        // only add max_views if provided
        if (maxViews) {
            updateData.max_views = maxViews;
        }

        // only add max_downloads if provided
        if (maxDownloads) {
            updateData.max_downloads = maxDownloads;
        }

        // only add expires_at if provided
        if (expiresAt) {
            updateData.expires_at = expiresAt;
        }

        // only add password if provided
        if (password) {
            updateData.file_password = password;
        }

        const { error } = await supabase
            .from("files")
            .update(updateData)
            .eq("id", file_id);


        if (error) throw error;

        return NextResponse.json({ success: true, message: "Access controls updated" });
    } catch (err) {
        console.error("Error in POST:", err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
