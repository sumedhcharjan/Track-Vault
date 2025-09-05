"use client";

import { supabase } from "@/lib/supabase";
import { redis } from "@/lib/redis";
import api from "@/lib/axios";
import { useState } from "react";
import "@/styles/globals.css"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

export default function PublicFilePage({ fileMeta }) {
  const [file, setFile] = useState(fileMeta);
  const [passwordRequired, setPasswordRequired] = useState(!!file.file_password);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const verifyPassword = async () => {
    setLoading(true);
    try {
      if (password === file.file_password) {
        setPasswordRequired(false);
        setError("");
      } else {
        setError("Invalid password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const triggerDeletePipeline = async (fileId) => {
    try {
      await api.delete("/deletepipeline", {
        data: { file_id: fileId },
      });
    } catch (err) {
      console.error("Delete pipeline error:", err.message);
    }
  };

const handleDownload = async () => {
  try {
    const res = await fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: file.id, type: "download" }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      alert("Download tracking failed. Limit might be reached.");
      return;
    }

    const response = await fetch(file.file_url);
    const blob = await response.blob();
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = file.file_name || "download";
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (err) {
    console.error("Download error:", err);
    alert("Something went wrong. Please try again.");
  }
};


  if (!file) {
    return (
      <Card className="max-w-md mx-auto mt-20 shadow-sm rounded-2xl">
        <CardContent className="p-6 text-center text-gray-600">
          File not found.
        </CardContent>
      </Card>
    );
  }

  if (file.expired) {
    return (
      <Card className="max-w-md mx-auto mt-20 shadow-sm rounded-2xl">
        <CardHeader>
          <CardTitle className="text-center text-red-600">
            File Unavailable
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center text-gray-600">
          This file has expired or is no longer available.
        </CardContent>
      </Card>
    );
  }

  if (passwordRequired) {
    return (
      <Card className="max-w-md mx-auto mt-20 shadow-md rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">
            Enter Password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="password"
            placeholder="Enter file password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button
            onClick={verifyPassword}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Checking..." : "Unlock"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto mt-12 shadow-md rounded-2xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-800 truncate">
          {file.file_name}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {file.file_type?.startsWith("image/") ? (
          <img
            src={file.file_url}
            alt={file.file_name}
            className="w-full rounded-lg shadow-sm"
          />
        ) : file.file_type?.startsWith("application/pdf") ? (
          <iframe
            src={file.file_url + "#page=1"}
            className="w-full h-[600px] rounded-lg shadow-sm"
            title={file.file_name}
          />
        ) : (
          <p className="text-sm text-gray-500 italic">
            Preview not available for this file type.
          </p>
        )}

        <Button
          onClick={handleDownload}
          className="w-full"
        >
          Download File
        </Button>
      </CardContent>
    </Card>
  );
}

export async function getServerSideProps({ params }) {
  const { id } = params;
  try {
    const { data: file, error } = await supabase
      .from("files")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !file) return { notFound: true };

    if (file.expires_at && new Date(file.expires_at).getTime() <= Date.now()) {
      if (file.delete_on_expire) {
        try {
          await api.delete("/deletepipeline", { data: { file_id: file.id } });
        } catch (err) {
          console.error("Delete pipeline (expire) failed:", err.message);
        }
      }
      return { props: { fileMeta: { ...file, expired: true } } };
    }

    const views = await redis.incr(`file:${id}:views`);
    await redis.set(`file:${id}:lastAccess`, Date.now());

    if (file.max_views && views > file.max_views) {
      await redis.decr(`file:${id}:views`);
      if (file.delete_on_limit && views >= file.max_views) {
        try {
          await api.delete("/deletepipeline", {
            data: { file_id: file.id },
          });
        } catch (err) {
          console.error("Delete pipeline (limit) failed:", err.message);
        }
      }
      return { props: { fileMeta: { ...file, expired: true } } };
    }

    return { props: { fileMeta: file } };
  } catch {
    return { notFound: true };
  }
}
