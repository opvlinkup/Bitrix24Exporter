import { createCompanies } from "../services/bitrixApi.js";

(async () => {
  try {
    console.log("Seeding Bitrix24 with companies...");
    const TOTAL = `100`;
    await createCompanies(TOTAL);
    console.log("Companies creation completed.");
    process.exit(0);
  } catch (error) {
    console.error("Error during companies creation:", error);
    process.exit(1);
  }
})();
