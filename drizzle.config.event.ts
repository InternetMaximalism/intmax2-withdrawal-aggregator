import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle/event",
  schema: "./packages/shared/src/drizzle/event-schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.EVENT_DATABASE_URL!,
  },
});
