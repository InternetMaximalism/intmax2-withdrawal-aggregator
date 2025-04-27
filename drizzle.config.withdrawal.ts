import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle/withdrawal",
  schema: "./packages/shared/src/drizzle/withdrawal-schema",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.WITHDRAWAL_DATABASE_URL!,
  },
});
