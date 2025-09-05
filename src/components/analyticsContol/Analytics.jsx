"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Analytics({ views, downloads, lastAccess, file }) {
  const [data, setData] = useState({ views, downloads, lastAccess });
  const [formattedDate, setFormattedDate] = useState("Never");

  useEffect(() => {
    if (data.lastAccess) {
      setFormattedDate(new Date(data.lastAccess).toLocaleString());
    }
  }, [data.lastAccess]);

  useEffect(() => {
    if (!file?.id) return;

    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`/api/analytics/get?id=${file.id}`);
        setData(res.data);
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [file?.id]);

  const handleCopy = async () => {
    try {
      const link = `${window.location.origin}/public/${file.id}`;
      await navigator.clipboard.writeText(
        `Here is the link to access your file:\n${link}\nPassword: ${file.file_password}`
      );
      console.log("URL copied successfully");
    } catch (err) {
      console.error("Error copying URL:", err);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
      <div className="sm:col-span-3 flex justify-start">
        <Button variant="outline" size="sm" onClick={handleCopy}>
          Copy Public URL
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Views</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-gray-800">{data.views ?? 0}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Downloads</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-gray-800">{data.downloads ?? 0}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Last Access</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">{formattedDate}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Password</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-semibold text-gray-800">{file.file_password || "—"}</p>
        </CardContent>
      </Card>

      <Card className="sm:col-span-3">
        <CardHeader>
          <CardTitle className="text-base font-medium">Public URL</CardTitle>
        </CardHeader>
        <CardContent>
        <p className="text-sm text-gray-600">{file.file_url}</p>
        </CardContent>
      </Card>
    </div>
  );
}
