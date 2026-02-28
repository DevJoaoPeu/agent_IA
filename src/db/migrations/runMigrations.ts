import "dotenv/config";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import postgres, { disconnectPostgres } from "../postgres";

const migrationsPath = resolve(__dirname, "migrations.sql");

const runMigrations = async (): Promise<void> => {
  const migrationSql = await readFile(migrationsPath, "utf-8");

  if (!migrationSql.trim()) {
    throw new Error("Arquivo de migration vazio.");
  }

  const client = await postgres.connect();

  try {
    await client.query("BEGIN");
    await client.query(migrationSql);
    await client.query("COMMIT");
    console.log("Migrations executadas com sucesso.");
  } catch (error: unknown) {
    await client.query("ROLLBACK");
    console.error("Erro ao executar migrations:", error);
    throw error;
  } finally {
    client.release();
    await disconnectPostgres();
  }
};

runMigrations().catch((error: unknown) => {
  console.error("Falha ao executar migrations:", error);
  process.exit(1);
});
