import "dotenv/config";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import postgres, { connectPostgres, disconnectPostgres } from "../postgres";

const migrationsPath = resolve(__dirname, "migrations.sql");

const runMigrations = async (): Promise<void> => {
  const migrationSql = await readFile(migrationsPath, "utf-8");

  if (!migrationSql.trim()) {
    throw new Error("Arquivo de migration vazio.");
  }

  await connectPostgres();
  const queryRunner = postgres.createQueryRunner();

  try {
    await queryRunner.connect();
    await queryRunner.startTransaction();
    await queryRunner.query(migrationSql);
    await queryRunner.commitTransaction();
    console.log("Migrations executadas com sucesso.");
  } catch (error: unknown) {
    if (queryRunner.isTransactionActive) {
      await queryRunner.rollbackTransaction();
    }
    console.error("Erro ao executar migrations:", error);
    throw error;
  } finally {
    await queryRunner.release();
    await disconnectPostgres();
  }
};

runMigrations().catch((error: unknown) => {
  console.error("Falha ao executar migrations:", error);
  process.exit(1);
});
