dotenv.config();
import express, { json } from "express";
import { loadCompanies, loadCompaniesToFile } from "./workers/companyLoader.js";
import { readdir } from "fs/promises";
import { readFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dataDir = join(__dirname, "./data");

const app = express();
const port = process.env.PORT || 3000;

app.use(json());

app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

app.get("/api/files", async (req, res) => {
  try {
    const files = await readdir(dataDir);
    const jsonFiles = files.filter((f) => f.endsWith(".json"));
    res.json(jsonFiles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Cannot read data directory" });
  }
});

app.get("/api/files/:filename", async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = join(dataDir, filename);
    let content;
    try {
      content = await readFile(filePath, "utf8");
    } catch (err) {
      console.warn(`File not found: ${filename}`);
      return res.json([]);
    }

    let data;
    try {
      data = JSON.parse(content);
      if (!Array.isArray(data)) data = [];
    } catch (err) {
      console.error(`Error parsing JSON in file ${filename}:`, err);
      data = [];
    }

    res.json(data);
  } catch (err) {
    console.error("Unexpected server error:", err);
    res.status(500).json({ error: "Unexpected server error" });
  }
});

app.post("/load/db", async (req, res) => {
  try {
    console.log("Loading started...");
    const total = await loadCompanies();
    res.json({ success: true, total });
  } catch (err) {
    console.error("Worker error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/load/file", async (req, res) => {
  try {
    const total = await loadCompaniesToFile();
    res.json({ success: true, total });
  } catch (err) {
    console.error("Worker File error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(port, () => console.log(`Server on port ${port}`));
