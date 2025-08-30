import FileCard from "@/components/filecard/Filecard";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { supabase } from "@/lib/supabase";

export default async function Uploadedfiles() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  const { data: files, error } = await supabase
    .from("files")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });



  if (error) {
    console.error("Error loading files", error);
    return <p className="p-6 text-red-500">Error loading files.</p>;
  }

  if (!files || files.length === 0) {
    return <p className="p-6 text-gray-500">No files uploaded yet.</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Your Files</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {files.map((file) => (
          <FileCard key={file.id} file={file} />
        ))}
      </div>
    </div>
  );
}
