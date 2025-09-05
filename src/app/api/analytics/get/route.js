import { redis } from "@/lib/redis";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Missing id", { status: 400 });
  }

  const [views, downloads, lastAccess] = await Promise.all([
    redis.get(`file:${id}:views`),
    redis.get(`file:${id}:downloads`),
    redis.get(`file:${id}:lastAccess`),
  ]);

  return Response.json({
    views: Number(views || 0),
    downloads: Number(downloads || 0),
    lastAccess: lastAccess ? new Date(Number(lastAccess)).toISOString() : null,
  });
}
