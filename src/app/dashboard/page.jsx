"use client"
import { Button } from "@/components/ui/button"
import { useKindeAuth } from "@kinde-oss/kinde-auth-nextjs"
import { useEffect, useState } from "react"
import api from "@/lib/axios"
import { Input } from "@/components/ui/input"

export default function Dashboard() {
  const { user } = useKindeAuth();
  const [file, setFile] = useState();
  const [saving, setSaving] = useState(false);

  const handleFileSubmit = async () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }

    if (!user?.id) {
      alert("Login first!");
      return;
    }

    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("user_id", user.id);
      formData.append("file_name", file.name);

      const res = await api.post("/file", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("File upload success:", res.data);
    } catch (err) {
      console.error("File upload error:", err.response?.data || err.message);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    api.post("/register")
      .then((res) => console.log("Register response:", res.data))
      .catch((err) => console.error("Error:", err.response?.data || err.message));
  }, [user]);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-md space-y-4 rounded-2xl border p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-center">Upload your file</h2>

        <Input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="cursor-pointer"
        />

        <Button
          onClick={handleFileSubmit}
          className="w-full"
          disabled={saving}
        >
          {saving ? "Saving..." : "Add File"}
        </Button>
      </div>
    </main>
  )
}
