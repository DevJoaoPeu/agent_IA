import Redis from "ioredis";
import { z } from "zod";

const redisEnvSchema = z.object({
  REDIS_HOST: z.string().min(1).default("localhost"),
  REDIS_PORT: z.coerce.number().int().min(1).max(65535).default(6379),
});

const redisEnv = redisEnvSchema.parse(process.env);

const redis = new Redis({
  host: redisEnv.REDIS_HOST,
  port: redisEnv.REDIS_PORT,
  maxRetriesPerRequest: 3
});

export const connectRedis = async () => {
  const redisIsActive: boolean = redis.status === "ready" || redis.status === "connecting"
  if (redisIsActive) {
    return;
  }

  await redis.connect();
};

export const disconnectRedis = async () => {
  if (redis.status === "end") {
    return;
  }

  await redis.quit();
};

export default redis;
