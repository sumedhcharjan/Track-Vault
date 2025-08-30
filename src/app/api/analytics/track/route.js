import { redis } from "@/lib/redis";

export async function POST(req) {
  const { id, type } = await req.json();
  if (!id || !type) {
    return new Response("Missing params", { status: 400 });
  }

  if (type === "view") {
    await redis.incr(`file:${id}:views`);
  }
  if (type === "download") {
    await redis.incr(`file:${id}:downloads`);
  }

  // always update last accessed
  await redis.set(`file:${id}:lastAccess`, Date.now());

  return Response.json({ success: true });
}
