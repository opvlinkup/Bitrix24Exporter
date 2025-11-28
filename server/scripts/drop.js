import { deleteCompanies } from "../services/bitrixApi.js";

(async () => {
  try {
    console.log("Removing companies...");
    await deleteCompanies();
    console.log("Companies removal completed.");
    process.exit(0);
  } catch (error) {
    console.error("Error during companies removal:", error);
    process.exit(1);
  }
})();
