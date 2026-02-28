import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

// Zwingt Drizzle, die .env.local Datei zu laden
dotenv.config({ path: ".env.local" });

export default defineConfig({
  schema: "./db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    // Wenn deine Variable POSTGRES_URL heißt, ändere das hier entsprechend ab!
    url: process.env.DATABASE_URL!, 
  },
  schemaFilter: ["public"],
});