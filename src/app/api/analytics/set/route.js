import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const data = await req.json();
    const {
      file_id,
      maxViews,
      maxDownloads,
      expiresAt,
      password,
      deleteOnExpire,
      deleteOnLimit,
    } = data;

    const updateData = {};

    if (maxViews !== null && maxViews !== undefined) {
      updateData.max_views = maxViews;
    }

    if (maxDownloads !== null && maxDownloads !== undefined) {
      updateData.max_downloads = maxDownloads;
    }

    if (expiresAt) {
      updateData.expires_at = expiresAt;
    }

    if (password) {
      updateData.file_password = password;
    }

    if (typeof deleteOnExpire === "boolean") {
      updateData.delete_on_expire = deleteOnExpire;
    }

    if (typeof deleteOnLimit === "boolean") {
      updateData.delete_on_limit = deleteOnLimit;
    }

    const { error } = await supabase
      .from("files")
      .update(updateData)
      .eq("id", file_id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: "Access controls updated",
    });
  } catch (err) {
    console.error("Error in POST:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
