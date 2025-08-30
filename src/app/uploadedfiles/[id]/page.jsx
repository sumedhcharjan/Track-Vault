import Analytics from "@/components/analyticsContol/analytics";
import Preview from "@/components/analyticsContol/preview";
import Editanalytics from "@/components/analyticsContol/Editanalytics";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { supabase } from "@/lib/supabase";
import { redirect } from "next/navigation";
import { redis }  from "@/lib/redis"

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
    <main>
      <h1>{file.file_name}</h1>
      <Preview file={file} />
      <Analytics
        views={Number(views) || 0} 
        downloads={Number(downloads) || 0} 
        lastAccess={lastAccess} 
        file={file} />
      <Editanalytics file={file} />
    </main>
  );
}
