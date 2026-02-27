import "dotenv/config";
import Fastify from "fastify";
import { connectRedis, disconnectRedis } from "./db/redis";
import { connectPostgres, disconnectPostgres } from "./db/postgres";

const app = Fastify({
  logger: true
});

app.get("/", async () => {
  return { message: "API rodando 🚀" };
});

app.addHook("onClose", async () => {
  await disconnectRedis();
  await disconnectPostgres();
});

const start = async () => {
  try {
    await connectRedis();
    await connectPostgres();
    app.log.info("Redis conectado");
    app.log.info("Postgres conectado");

    await app.listen({ port: 3000 });
  } catch (error: unknown) {
    app.log.error(error);
    await disconnectRedis();
    process.exit(1);
  }
};

start();
