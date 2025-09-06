import FileCard from "@/components/filecard/Filecard";
import InactiveFileCard from "@/components/filecard/InactiveFileCard";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";


export default async function Uploadedfiles() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <p className="text-red-500 font-medium">
          You must be logged in to view files.
        </p>
      </div>
    );
  }


  const { data: files, error } = await supabase
    .from("files")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading files", error);
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <p className="text-red-500 font-medium">
          Failed to load files. Please try again.
        </p>
      </div>
    );
  }

  if (!files || files.length === 0) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-64 text-center">
        <p className="text-gray-500 text-lg">You haven’t uploaded any files yet.</p>
        <p className="text-sm text-gray-400 mt-1">
          Upload files from your dashboard to see them here.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">Your Files</h1>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-green-600">
          Active Files
        </h2>
        {files.some((file) => file.is_active) ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {files
              .filter((file) => file.is_active)
              .map((file) => (
                <FileCard key={file.id} file={file} />
              ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No active files.</p>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4 text-gray-600">
          Inactive Files
        </h2>
        {files.some((file) => !file.is_active) ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {files
              .filter((file) => !file.is_active)
              .map((file) => (
                <InactiveFileCard key={file.id} file={file} />
              ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No inactive files.</p>
        )}
      </section>
    </div>
  );
}
