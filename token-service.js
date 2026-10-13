
import crypto from "node:crypto";
import Redis from "ioredis";
import "dotenv/config";

const redis = new Redis(process.env.REDIS_URL);

const keyFor = (id) => "token:" + id;

// Create a token and save its payload in Redis.
export async function issueToken(payload, ttlSeconds) {
  const tokenId = crypto.randomBytes(16).toString("hex");
  const value = JSON.stringify(payload);

  await redis.set(keyFor(tokenId), value, "EX", ttlSeconds, "NX");

  return tokenId;
}

// Read and delete the token in one atomic operation.
export async function consumeToken(tokenId) {
  const value = await redis.getdel(keyFor(tokenId));

  if (value === null) {
    return { ok: false, reason: "invalid" };
  }

  return { ok: true, payload: JSON.parse(value) };
}

// Close the Redis connection after testing.
export function closeRedis() {
  return redis.quit();
}


