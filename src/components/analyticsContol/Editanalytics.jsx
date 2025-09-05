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
    } catch {
      setMessage("Error connecting to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="my-6 shadow-sm rounded-2xl">
      <CardHeader>
        <CardTitle className="text-base font-medium text-gray-800">
          Edit Access Control
        </CardTitle>
      </CardHeader>

      <CardContent>
        {!showForm ? (
          <Button onClick={() => setShowForm(true)} className="w-full">
            Edit Access Rules
          </Button>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-6 p-4 border rounded-xl bg-gray-50"
          >
            {/* Expiry Date */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Expiry Date</Label>
              <Input
                type="datetime-local"
                value={expiresAt}
                placeholder={file.expires_at || "Set expiry date"}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
              <div className="flex items-center gap-2 mt-1">
                <Checkbox
                  checked={deleteOnExpire}
                  onCheckedChange={(val) => setDeleteOnExpire(!!val)}
                />
                <Label className="text-sm text-gray-600">
                  Delete file after expiry
                </Label>
              </div>
            </div>

            {/* Max Views */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Max Views</Label>
              <Input
                type="number"
                value={maxViews}
                placeholder={file.max_views || "No limit"}
                onChange={(e) => setMaxViews(e.target.value)}
              />
              <div className="flex items-center gap-2 mt-1">
                <Checkbox
                  checked={deleteOnLimit}
                  onCheckedChange={(val) => setDeleteOnLimit(!!val)}
                />
                <Label className="text-sm text-gray-600">
                  Delete file after max views/downloads reached
                </Label>
              </div>
            </div>

            {/* Max Downloads */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Max Downloads</Label>
              <Input
                type="number"
                value={maxDownloads}
                placeholder={file.max_downloads || "No limit"}
                onChange={(e) => setMaxDownloads(e.target.value)}
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Password (optional)</Label>
              <Input
                type="text"
                value={password}
                placeholder={file.file_password || "No password set"}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Save Button */}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Saving..." : "Save Access Rules"}
            </Button>

            {/* Message */}
            {message && (
              <p
                className={`text-sm mt-2 ${
                  message.includes("successfully")
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {message}
              </p>
            )}
          </form>
        )}
      </CardContent>
    </Card>
  );
}
