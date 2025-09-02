// pages/public/[id].js
"use client";
import { supabase } from "@/lib/supabase";
import { redis } from "@/lib/redis";
import { Button } from "@/components/ui/Button";
import "@/styles/globals.css";
import { useState } from "react";
import api from "@/lib/axios";

export default function PublicFilePage({ fileMeta, views }) {
  const [file, setFile] = useState(fileMeta);
  const [passwordRequired, setPasswordRequired] = useState(!!file.file_password);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const verifyPassword = async () => {
    setLoading(true);
    try {
      if (password === file.file_password) {
        setPasswordRequired(false); // unlock file
        setError("");
      } else {
        setError("Invalid password");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const { data } = await api.get("/analytics/get", {
        params: { id: file.id },
      });
      const current = Number(data.downloads) || 0;
      const max = Number(file.max_downloads) || Infinity;

      if (current >= max) {
        alert("Download limit reached!");
        return;
      }

      await api.post("/analytics/track", { id: file.id, type: "download" });

      const response = await fetch(file.file_url);
      const blob = await response.blob();

      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = file.file_name || "download";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    }
  };

  // if password protection enabled → ask first
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

  // otherwise show file directly
  if (!file) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 border rounded-lg shadow">
        <p>File not found</p>
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

// SSR
export async function getServerSideProps({ params }) {
  const { id } = params;

  try {
    const { data: file, error } = await supabase
      .from("files")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !file) {
      return { notFound: true };
    }

    await redis.incr(`file:${id}:views`);
    await redis.set(`file:${id}:lastAccess`, Date.now());
    const views = await redis.get(`file:${file.id}:views`);

    return {
      props: {
        fileMeta: file,
        views,
      },
    };
  } catch (err) {
    console.error(err);
    return { notFound: true };
  }
}
