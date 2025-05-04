import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  schema: './src/database/schema.js',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DB_FILE_NAME || 'db.sqlite',
    database: 'bun:sqlite'
  }
});