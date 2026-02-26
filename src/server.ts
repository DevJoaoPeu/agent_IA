import Fastify from "fastify";

const app = Fastify({
  logger: true
});

app.get("/", async (request, reply) => {
  return { message: "API rodando 🚀" };
});

const start = async () => {
  try {
    await app.listen({ port: 3000 });
  } catch (error: unknown) {
    app.log.error(error);
    process.exit(1);
  }
};

start();