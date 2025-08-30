"use client";
import { useState } from "react";
import api from "@/lib/axios";
import { Button } from "../ui/button";
import { toast } from "sonner";
import Link from "next/link";


export default function Options({ file }) {
  const [loading, setLoading] = useState(false);

  // delete file
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

  // copy url
  const handleCopy = async () => {
    try {
      const link = `http://localhost:3000/public/${file.id}`;
      await navigator.clipboard.writeText(
      `Here is the link to access your file: ${link}\nPassword: ${file.file_password}`
      );

      // track view event when someone copies link
      // await api.post("/analytics/track", {
      //   id: file.id,
      //   type: "view",
      // });
    } catch (err) {
      console.error(err);
      toast.error("Error copying URL");
    }
  };

  // download file
  const handleDownload = async () => {
    try {
      // track download event
      await api.post("/analytics/track", {
        id: file.id,
        type: "download",
      });

      // trigger download
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
    <div className="flex flex-row gap-2 flex-wrap">
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopy}
        disabled={loading}
      >
        Copy URL
      </Button>

      <Button
        variant="secondary"
        size="sm"
        onClick={handleDownload}
        disabled={loading}
      >
        Download
      </Button>

      <Button
        variant="destructive"
        size="sm"
        onClick={handleDelete}
        disabled={loading}
      >
        {loading ? "Deleting..." : "Delete"}
      </Button>

      <Link href={`/uploadedfiles/${file.id}`}>
        <Button size="sm">
          Analytics and Edit Constraints
        </Button>
      </Link>
    </div>
  );
}
