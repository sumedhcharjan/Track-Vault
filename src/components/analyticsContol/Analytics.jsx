"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function Analytics({ views, downloads, lastAccess, file }) {
  const [data, setData] = useState({
    views,
    downloads,
    lastAccess,
  });
  

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
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
      hello
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
          <CardTitle>password</CardTitle>
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
          <p className="text-sm text-gray-600">
            {data.lastAccess
              ? new Date(data.lastAccess).toLocaleString()
              : "Never"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
