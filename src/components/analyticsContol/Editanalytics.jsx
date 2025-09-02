"use client";

import { useState } from "react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

export default function EditAccessForm({ file }) {
  const [expiresAt, setExpiresAt] = useState("");
  const [maxViews, setMaxViews] = useState("");
  const [maxDownloads, setMaxDownloads] = useState("");
  const [password, setPassword] = useState("");
  const [isOneTime, setIsOneTime] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await api.post("/analytics/set", {
        file_id: file.id,
        expiresA: expiresAt || null,
        maxViews: maxViews ? Number(maxViews) : null,
        maxDownloads: maxDownloads ? Number(maxDownloads) : null,
        password: password || null,
        isOneTime,
      });

      if (res.data.success) {
        setShowForm(false);
        setMessage("Access rules updated successfully!");
      } else {
        setMessage(res.data.error || "Failed to update access rules.");
      }
    } catch (err) {
      setMessage("Error connecting to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>

      <Card className="p-4">
        <CardHeader>
          <CardTitle>Edit Access Control</CardTitle>
        </CardHeader>

        <CardContent>
          {!showForm ? (
            <Button onClick={() => setShowForm(true)}>Edit Access Rules</Button>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="space-y-4 p-4 border rounded-lg shadow-md"
            >
              <div className="space-y-2">
                <Label>Expiry Date:</Label>
                <Input
                  type="datetime-local"
                  value={expiresAt}
                  placeholder={file.edpiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Max Views:</Label>
                <Input
                  type="number"
                  value={maxViews}
                  placeholder={file.max_views}
                  onChange={(e) => setMaxViews(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Max Downloads:</Label>
                <Input
                  type="number"
                  value={maxDownloads}
                  placeholder={file.max_downloads}
                  onChange={(e) => setMaxDownloads(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Password (optional):</Label>
                <Input
                  type="text"
                  value={password}
                  placeholder={file.file_password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  checked={isOneTime}
                  onCheckedChange={(val) => setIsOneTime(!!val)}
                />
                <Label>One-time link</Label>
              </div>

              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Access Rules"}
              </Button>

              {message && <p className="text-sm mt-2">{message}</p>}
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
