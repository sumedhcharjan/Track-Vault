"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";

export default function Analytics({ views, downloads, lastAccess, file }) {
  const [data, setData] = useState({
    views,
    downloads,
    lastAccess,
  });

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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopy}
      >
        Copy URL
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Views</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{data.views}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{file.file_password}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Downloads</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{data.downloads}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Last Access</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">{formattedDate}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>public url</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">{file.file_url}</p>
        </CardContent>
      </Card>
    </div>
  );
}
