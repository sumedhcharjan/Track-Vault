"use client"
import { Button } from "@/components/ui/button"
import { useKindeAuth } from "@kinde-oss/kinde-auth-nextjs"
import { useEffect, useState } from "react"
import api from "@/lib/axios"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { FlickeringGrid } from "@/components/ui/flickering-grid"

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
      toast("File uploaded successfully!", {
        description: file.name + " has been uploaded.",
      });
      setFile(undefined); // Clear the upload field
    } catch (err) {
      toast("File upload error:", err.response?.data || err.message);
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
    <main className="relative flex flex-col items-center justify-center min-h-screen px-4 bg-white">
    <div className="absolute inset-0 z-0">
        <FlickeringGrid
          squareSize={6}
          gridGap={5}
          className="w-full h-full opacity-70"
          color="#1a17b3"
          maxOpacity={0.2}
        />
      </div>
      <Card className="relative z-10 w-full max-w-md backdrop-blur-lg  border border-gray-700 rounded-3xl shadow-2xl hover:shadow-gray-900/30 transition-all duration-500 ease-in-out">
        <CardHeader>
          <CardTitle className="text-3xl font-extrabold text-center bg-gradient-to-r from-gray-200 to-gray-400 bg-clip-text  tracking-tight">
            Secure File Upload
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative group border border-dashed border-gray-500 rounded-xl p-6 text-center cursor-pointer hover:border-gray-300 hover:bg-white/5 transition-all duration-300 ease-in-out">
            <Label htmlFor="file-upload" className="block text-lg font-medium text-gray-400 group-hover:text-gray-700 mb-2 cursor-pointer">
              {file ? file.name : "Drag & Drop or Click to Browse"}
            </Label>
            <Input
              id="file-upload"
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
              <svg className="w-12 h-12 text-gray-400 group-hover:text-gray-700 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 0115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
              {file && <p className="text-sm text-gray-500">File selected: {file.name}</p>}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleFileSubmit}
            className="w-full bg-gradient-to-r from-gray-900 to-gray-700 hover:from-black hover:to-gray-800 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-gray-900/50 transition-all duration-300 ease-in-out transform hover:scale-[1.01]"
            disabled={saving}
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </span>
            ) : (
              "Upload File"
            )}
          </Button>
        </CardFooter>
      </Card>
    </main>
  )
}
