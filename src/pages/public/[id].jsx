"use client";

import { supabase } from "@/lib/supabase";
import { redis } from "@/lib/redis";
import { Button } from "@/components/ui/Button";
import "@/styles/globals.css";
import { useState } from "react";
import api from "@/lib/axios";

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
        setError("Invalid password");
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
      const downloads = await redis.incr(`file:${file.id}:downloads`);
      if (file.max_downloads && downloads > file.max_downloads) {
        await redis.decr(`file:${file.id}:downloads`);
        alert("Download limit reached");
        return;
      }
      if (file.delete_on_limit && file.max_downloads && downloads >= file.max_downloads) {
        await triggerDeletePipeline(file.id);
      }
      const response = await fetch(file.file_url);
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = file.file_name || "download";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert("Something went wrong. Please try again.");
    }
  };

  if (!file) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 border rounded-lg shadow">
        <p>File not found</p>
      </div>
    );
  }

  // ✅ File expired check
  if (file.expired) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 border rounded-lg shadow">
        <p>This file has expired or is no longer available.</p>
      </div>
    );
  }

  if (passwordRequired) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 border rounded-lg shadow">
        <h1 className="text-xl font-bold mb-4">Enter Password</h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 rounded"
        />
        {error && <p className="text-red-500 mt-2">{error}</p>}
        <Button
          onClick={verifyPassword}
          disabled={loading}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading ? "Checking..." : "Unlock"}
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 border rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4">{file.file_name}</h1>
      {file.file_type?.startsWith("image/") ? (
        <img src={file.file_url} alt={file.file_name} className="w-full rounded" />
      ) : file.file_type?.startsWith("application/pdf") ? (
        <iframe
          src={file.file_url + "#page=1"}
          className="w-full h-[600px] rounded"
          title={file.file_name}
        />
      ) : (
        <p className="text-sm text-gray-500">Preview not available</p>
      )}
      <Button
        onClick={handleDownload}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
      >
        Download
      </Button>
    </div>
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
          await api.delete("/deletepipeline", {
            data: { file_id: file.id },
          });
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
