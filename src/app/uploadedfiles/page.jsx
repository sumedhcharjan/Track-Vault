import FileCard from "@/components/filecard/Filecard";
import InactiveFileCard from "@/components/filecard/InactiveFileCard";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { FlickeringGrid } from "@/components/ui/flickering-grid";

export const dynamic = "force-dynamic";

export default async function Uploadedfiles() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return (
      <main className="container mx-auto px-4 py-16 mt-20">
        <Card className="p-8 text-center">
          <p className="text-red-500 font-medium">
            You must be logged in to view files.
          </p>
        </Card>
      </main>
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
      <main className="container mx-auto px-4 py-16 mt-20">
        <Card className="p-8 text-center">
          <p className="text-red-500 font-medium">
            Failed to load files. Please try again.
          </p>
        </Card>
      </main>
    );
  }

  if (!files || files.length === 0) {
    return (
      <main className="container mx-auto px-4 py-16 mt-20">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-semibold mb-4">Your Files</h1>
          <Separator className="my-4" />
          <p className="text-gray-500 text-lg">
            You haven't uploaded any files yet.
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Upload files from your dashboard to see them here.
          </p>
        </Card>
      </main>
    );
  }

  const activeFiles = files.filter((file) => file.is_active);
  const inactiveFiles = files.filter((file) => !file.is_active);

  return (
    <main className="container mx-auto px-4 mt-25 mb-5">
    <div className="absolute inset-0 z-[-1]">
        <FlickeringGrid
          squareSize={6}
          gridGap={5}
          className="w-full h-full opacity-70"
          color="#1a17b3"
          maxOpacity={0.2}
        />
      </div>
      <div className="flex flex-col items-center text-center space-y-4 mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Your Files</h1>
        <p className="text-lg text-gray-500">
          Manage and track your uploaded files
        </p>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
          <TabsTrigger value="active">Active Files</TabsTrigger>
          <TabsTrigger value="inactive">Inactive Files</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <Card className="p-6 backdrop-blur-lg ">
            {activeFiles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr">
                {activeFiles.map((file) => (
                  <FileCard key={file.id} file={file} />
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No active files.</p>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="inactive">
          <Card className="p-6 ">
            {inactiveFiles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr">
                {inactiveFiles.map((file) => (
                  <InactiveFileCard key={file.id} file={file} />
                ))}
              </div>
            ) : (
              <p className="text-center py-8 ">No inactive files.</p>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
