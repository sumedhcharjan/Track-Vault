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
  const [deleteOnExpire, setDeleteOnExpire] = useState(file.delete_on_expire || false);
  const [deleteOnLimit, setDeleteOnLimit] = useState(file.delete_on_limit || false);
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
        expiresAt: expiresAt || null,
        maxViews: maxViews ? Number(maxViews) : null,
        maxDownloads: maxDownloads ? Number(maxDownloads) : null,
        password: password || null,
        deleteOnExpire,
        deleteOnLimit,
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
                  placeholder={file.expires_at}
                  onChange={(e) => setExpiresAt(e.target.value)}
                />
                <div className="flex items-center gap-2 mt-2">
                  <Checkbox
                    checked={deleteOnExpire}
                    onCheckedChange={(val) => setDeleteOnExpire(!!val)}
                  />
                  <Label>Delete file after expiry</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Max Views:</Label>
                <Input
                  type="number"
                  value={maxViews}
                  placeholder={file.max_views}
                  onChange={(e) => setMaxViews(e.target.value)}
                />
                <div className="flex items-center gap-2 mt-2">
                  <Checkbox
                    checked={deleteOnLimit}
                    onCheckedChange={(val) => setDeleteOnLimit(!!val)}
                  />
                  <Label>Delete file after max views/downloads reached</Label>
                </div>
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

              {/* Password */}
              <div className="space-y-2">
                <Label>Password (optional):</Label>
                <Input
                  type="text"
                  value={password}
                  placeholder={file.file_password}
                  onChange={(e) => setPassword(e.target.value)}
                />
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
