import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import query from "../repository/db.js";

(async function runMigrations() {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    const filePath = join(__dirname, "../migrations/001_create_companies.sql");
    const sql = readFileSync(filePath, "utf8");

    console.log("Running migration...");
    await query(sql);
    console.log("Migration completed.");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
})();
