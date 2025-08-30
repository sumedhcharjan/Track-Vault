// pages/public/[id].js
"use client";
import { supabase } from "@/lib/supabase";
import { redis } from "@/lib/redis";
import { Button } from "@/components/ui/Button";
import "@/styles/globals.css";



import { useState, useEffect } from "react";
import api from "@/lib/axios";
export default function PublicFilePage({ fileMeta }) {
  const [file, setFile] = useState(fileMeta);
  const [passwordRequired, setPasswordRequired] = useState(true);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const verifyPassword = async (file) => {
    setLoading(true);
    try {
    console.log(file.file_password)
    console.log(password)
      if (password === fileMeta.file_password) {
        setPasswordRequired(false);
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
      await api.post("file/download", { id: file.id });
      // Trigger browser download
      const link = document.createElement("a");
      link.href = file.url;
      link.download = file.name;
      link.click();
    } catch (err) {
      console.error(err);
    }
  };

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
      ) : file.type?.startsWith("application/pdf") ? (
        <iframe
          src={file.filr_url + "#page=1"}
          className="w-full h-[600px] rounded"
          title={file.name}
        />
      ) : (
        <p className="text-sm text-gray-500">Preview not available</p>
      )}

      <Button
        variant="secondary"
        size="sm"
        onClick={handleDownload}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
      >
        Download
      </Button>
    </div>
  );
}

// SSR to fetch file metadata before rendering
export async function getServerSideProps({ params }) {
  const { id } = params;

  try {
    // Fetch file meta from Supabase
    const { data: file, error } = await supabase
      .from("files")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !file) {
      return { notFound: true };
    }

    // Increment view counter in redis
    await redis.incr(`file:${id}:views`);
    await redis.set(`file:${id}:lastAccess`, Date.now());

    return {
      props: {
        fileMeta: file,
      },
    };
  } catch (err) {
    console.error(err);
    return { notFound: true };
  }
}
