import { getCompanies } from "../services/bitrixApi.js";
import { saveCompanies } from "../services/companyService.js";
import { mkdir, writeFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import mapCompany from "../mappers/bitrixMapper.js";

const BATCH_SIZE = Number(process.env.BATCH_SIZE || 50);
const FILE_SIZE = Number(process.env.FILE_SIZE || 1000);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dataDir = join(__dirname, "../data");

export async function loadCompanies() {
  let start = 0;
  let savedCompanies = 0;

  while (true) {
    const data = await getCompanies(start, BATCH_SIZE);

    const batch =
      data?.result && Array.isArray(data.result)
        ? data.result
        : Array.isArray(data)
        ? data
        : null;

    if (!batch || batch.length === 0) break;

    await saveCompanies(batch);

    savedCompanies += batch.length;
    console.log(`Saved ${batch.length} companies (total: ${savedCompanies})`);

    start = typeof data.next === "number" ? data.next : start + batch.length;

    if (batch.length < BATCH_SIZE) break;
  }

  return savedCompanies;
}

export async function loadCompaniesToFile() {
  await mkdir(dataDir, { recursive: true });

  let start = 0;
  let totalSaved = 0;
  let fileIndex = 1;
  let batchBuffer = [];
  const seenIds = new Set();
  let hasMore = true;

  while (hasMore) {
    const data = await getCompanies(start, BATCH_SIZE);

    const batch = Array.isArray(data?.result) ? data.result : null;

    if (!batch || batch.length === 0) break;

    const normalizedCompanies = batch.map(mapCompany).filter((c) => {
      const id = String(c.id);
      if (seenIds.has(id)) return false;
      seenIds.add(id);
      return true;
    });

    if (normalizedCompanies.length > 0) {
      batchBuffer.push(...normalizedCompanies);
      totalSaved += normalizedCompanies.length;
    }

    while (batchBuffer.length >= FILE_SIZE) {
      const chunk = batchBuffer.splice(0, FILE_SIZE);
      const filePath = join(dataDir, `companies_${fileIndex}.json`);
      await writeFile(filePath, JSON.stringify(chunk, null, 2), "utf8");
      console.log(`Saved ${chunk.length} companies to ${filePath}`);
      fileIndex++;
    }

    if (typeof data.next === "number" && data.next > start) {
      start = data.next;
    } else {
      hasMore = false;
    }
  }

  if (batchBuffer.length > 0) {
    const filePath = join(dataDir, `companies_${fileIndex}.json`);
    await writeFile(filePath, JSON.stringify(batchBuffer, null, 2), "utf8");
    console.log(`Saved ${batchBuffer.length} companies to ${filePath}`);
  }

  console.log(`All companies saved (${totalSaved} total)`);
  return totalSaved;
}
