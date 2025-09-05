import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { redis } from "@/lib/redis";

export default async function InactiveFileCard({ file }) {
  const [views, downloads, lastAccess] = await Promise.all([
    redis.get(`file:${file.id}:views`),
    redis.get(`file:${file.id}:downloads`),
    redis.get(`file:${file.id}:lastAccess`),
  ]);

  return (
    <Card className="w-full border rounded-2xl shadow hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-gray-800 truncate">
          {file.file_name}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-2 text-sm text-gray-600">
        <div className="flex justify-between">
          <span className="font-medium">Views:</span>
          <span>{views ?? 0}</span>
        </div>

        <div className="flex justify-between">
          <span className="font-medium">Downloads:</span>
          <span>{downloads ?? 0}</span>
        </div>

        <div className="flex justify-between">
          <span className="font-medium">Last accessed:</span>
          <span>{lastAccess ? new Date(lastAccess).toLocaleString() : "—"}</span>
        </div>

        <div className="flex justify-between">
          <span className="font-medium">Expired at:</span>
          <span>{file.expires_at ? new Date(file.expires_at).toLocaleString() : "—"}</span>
        </div>
      </CardContent>
    </Card>
  );
}
