"use client";
import { useState } from "react";
import api from "@/lib/axios";
import { Button } from "../ui/button";
import { toast } from "sonner";
import Link from "next/link";

export default function Options({ file }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await api.delete("/file", {
        data: { file_id: file.id, file_key: file.file_key },
      });
      toast.success("File deleted successfully");
      window.location.reload();
    } catch (err) {
      console.error(err);
      toast.error("Error deleting file");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      const link = `${window.location.origin}/public/${file.id}`;
      await navigator.clipboard.writeText(
        `Here is the link to access your file: ${link}\nPassword: ${file.file_password}`
      );
      toast.success("Link copied to clipboard");
    } catch (err) {
      console.error(err);
      toast.error("Error copying URL");
    }
  };

  const handleDownload = async () => {
    try {
      const link = document.createElement("a");
      link.href = file.file_url;
      link.download = file.file_name;
      link.click();
      toast.success("Download started");
    } catch (err) {
      console.error(err);
      toast.error("Error downloading file");
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopy}
        disabled={loading}
        className="hover:bg-blue-50"
      >
        Copy URL
      </Button>

      <Button
        variant="secondary"
        size="sm"
        onClick={handleDownload}
        disabled={loading}
        className="hover:bg-gray-100"
      >
        Download
      </Button>

      <Button
        variant="destructive"
        size="sm"
        onClick={handleDelete}
        disabled={loading}
        className="hover:bg-red-600"
      >
        {loading ? "Deleting..." : "Delete"}
      </Button>

      <Link href={`/uploadedfiles/${file.id}`} className="flex">
        <Button size="sm" variant="default" className="bg-indigo-600 hover:bg-indigo-700">
          Analytics & Edit
        </Button>
      </Link>
    </div>
  );
}
