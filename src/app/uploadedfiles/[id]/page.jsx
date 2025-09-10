import Analytics from "@/components/analyticsContol/Analytics";
import Preview from "@/components/analyticsContol/Preview";
import Editanalytics from "@/components/analyticsContol/Editanalytics";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { supabase } from "@/lib/supabase";
import { redirect } from "next/navigation";
import { redis } from "@/lib/redis";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FlickeringGrid } from "@/components/ui/flickering-grid";

export const revalidate = 10;

export default async function FileAnalyticsPage({ params }) {
  const { id } = await params;
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    redirect("/api/auth/login");
  }

  const { data: file, error } = await supabase
    .from("files")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    redirect("/uploadedfiles");
  }

  if (!file || file.user_id !== user.id) {
    redirect("/uploadedfiles");
  }

  const [views, downloads, lastAccess] = await Promise.all([
    redis.get(`file:${id}:views`),
    redis.get(`file:${id}:downloads`),
    redis.get(`file:${id}:lastAccess`),
  ]);

  return (
    <main className="relative container mx-auto px-4 pb-10 mt-25 min-h-screen">
      <div className="fixed inset-0 z-[-1] w-full h-full">
        <FlickeringGrid
          squareSize={6}
          gridGap={5}
          className="w-full h-full opacity-70"
          color="#1a17b3"
          maxOpacity={0.2}
        />
      </div>
      <div className="flex flex-col items-center text-center space-y-4 mb-8">
        <h1 className="text-4xl font-bold tracking-tight">{file.file_name}</h1>
        <p className="text-lg text-gray-500">File Analytics and Management</p>
      </div>

      <Card className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
          <div className="bg-gray-50 rounded-lg p-6 flex items-center justify-center min-h-[300px]">
            <Preview file={file} />
          </div>

          <div className="space-y-6">
            <div className="pb-4 border-b">
              <h2 className="text-2xl font-semibold mb-2">Analytics Overview</h2>
              <p className="text-sm text-gray-500">
                Track your file&apos;s performance and usage
              </p>
            </div>
            <Analytics
              views={Number(views) || 0}
              downloads={Number(downloads) || 0}
              lastAccess={lastAccess}
              file={file}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="pb-4 border-b">
          <h2 className="text-2xl font-semibold mb-2">Manage Settings</h2>
          <p className="text-sm text-gray-500">
            Configure and update your file settings
          </p>
        </div>
        <Editanalytics file={file} />
      </Card>
    </main>
  );
}
