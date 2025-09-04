import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { redis } from "@/lib/redis";

export default async function InactiveFileCard({ file }) {
  const [views, downloads, lastAccess] = await Promise.all([
    redis.get(`file:${file.id}:views`),
    redis.get(`file:${file.id}:downloads`),
    redis.get(`file:${file.id}:lastAccess`),
  ]);
  return (
    <Card className="w-full shadow-sm border rounded-2xl">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800">
          {file.file_name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-gray-600">
        <p><span className="font-medium">Views:</span> {views ?? 0}</p>
        <p><span className="font-medium">Downloads:</span> {downloads ?? 0}</p>
        <p><span className="font-medium">Last accessed at:</span>{" "} 
            {lastAccess ? new Date(lastAccess).toLocaleString() : "—"}

        </p>
        <p>
          <span className="font-medium">Expired At:</span>{" "}
          {file.expires_at ? new Date(file.expires_at).toLocaleString() : "—"}
        </p>
      </CardContent>
    </Card>
  );
}
