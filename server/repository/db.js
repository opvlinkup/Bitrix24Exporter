dotenv.config();

import { Pool } from "pg";
import dotenv from "dotenv";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const cert = readFileSync(join(__dirname, "../certs/ca.pem")).toString();

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
  ssl: {
    rejectUnauthorized: true,
    ca: cert,
  },
});

export default function query(text, params) {
  return pool.query(text, params);
}

export { pool };
