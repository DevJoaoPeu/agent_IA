import "dotenv/config";
import Fastify from "fastify";
import { z } from "zod";
import { orchestrateClinicMessage } from "./agents/orchestrator";
import { connectRedis, disconnectRedis } from "./db/redis";
import { connectPostgres, disconnectPostgres } from "./db/postgres";

const app = Fastify({
  logger: true
});

app.get("/", async () => {
  return { message: "API rodando 🚀" };
});

const orchestrationBodySchema = z.object({
  message: z.string().trim().min(1, "message e obrigatoria")
});

type OrchestrationBody = z.infer<typeof orchestrationBodySchema>;

app.post<{ Body: OrchestrationBody }>("/atendimento/orchestrator", async (request, reply) => {
  const parsedBody = orchestrationBodySchema.safeParse(request.body);

  if (!parsedBody.success) {
    return reply.code(400).send({
      error: "Payload invalido",
      details: parsedBody.error.flatten()
    });
  }

  const orchestrationResult = orchestrateClinicMessage(parsedBody.data.message);
  return reply.send(orchestrationResult);
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
