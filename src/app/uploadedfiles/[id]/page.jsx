import Analytics from "@/components/analyticsContol/analytics";
import Preview from "@/components/analyticsContol/Preview";
import Editanalytics from "@/components/analyticsContol/Editanalytics";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { supabase } from "@/lib/supabase";
import { redirect } from "next/navigation";
import { redis } from "@/lib/redis";

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
    <main className="max-w-7xl mx-auto px-6 py-12 space-y-10">
      <h1 className="text-3xl font-bold text-gray-900 text-center">
        {file.file_name}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-md border p-6 flex items-center justify-center">
          <Preview file={file} />
        </div>

        <div className="bg-white rounded-2xl shadow-md border p-6">
          <Analytics
            views={Number(views) || 0}
            downloads={Number(downloads) || 0}
            lastAccess={lastAccess}
            file={file}
          />
        </div>
      </div>

      <div className="flex justify-center">
        <div className="w-full md:w-2/3">
          <div className="bg-white rounded-2xl shadow-md border p-6">
            <Editanalytics file={file} />
          </div>
        </div>
      </div>
    </main>
  );
}
