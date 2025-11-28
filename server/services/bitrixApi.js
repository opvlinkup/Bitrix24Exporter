import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const apiClient = axios.create({
  baseURL: process.env.BITRIX24_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function createCompany(index) {
  try {
    const email = `testcompany_${index}@fakemail.com`;
    const phone = `+37529${String(index).padStart(7, "0")}`;

    const response = await apiClient.post(`/crm.company.add`, {
      fields: {
        TITLE: `Company ${index} Title`,
        PHONE: [{ VALUE: phone, VALUE_TYPE: "WORK" }],
        EMAIL: [{ VALUE: email, VALUE_TYPE: "WORK" }],
        ADDRESS: `Test Address ${index}`,
      },
    });
    return response.data;
  } catch (err) {
    console.error(
      `Error creating company ${index}:`,
      err.response?.data?.error_description || err.message
    );
    return null;
  }
}

export async function createCompanies(total = 100) {
  let created = 0;

  for (let i = 1; i <= total; i++) {
    const result = await createCompany(i);
    if (result && result.result) {
      created++;
      console.log(`Created ${created}/${total} (Bitrix ID: ${result.result})`);
    } else {
      console.log(`Failed to create company #${i}.`);
    }
    await sleep(500);
  }
  return created;
}

export async function getCompanies(start = 0, batchSize = 50) {
  try {
    const response = await apiClient.get("/crm.company.list", {
      params: {
        start,
        order: { ID: "ASC" },
        select: ["ID", "TITLE", "PHONE", "EMAIL", "ADDRESS", "DATE_CREATE"],
      },
    });

    const data = response.data;
    const result = Array.isArray(data?.result) ? data.result : [];

    return {
      result,
      next: data.next,
      total: data.total,
    };
  } catch (err) {
    console.error(
      "Error fetching companies:",
      err.response?.data || err.message
    );
    return { result: [], next: null };
  }
}

export async function getAllCompanyIds() {
  let start = 0;
  const allIds = [];
  let hasMore = true;

  while (hasMore) {
    try {
      const response = await apiClient.get("/crm.company.list", {
        params: {
          start,
          select: ["ID"],
        },
      });

      const data = response.data;
      const currentIds = Array.isArray(data?.result)
        ? data.result.map((c) => c.ID)
        : [];

      if (currentIds.length === 0) {
        hasMore = false;
        break;
      }

      allIds.push(...currentIds);

      if (typeof data.next === "number") {
        start = data.next;
      } else {
        hasMore = false;
      }
    } catch (err) {
      console.error("Error fetching company IDs:", err.message);
      hasMore = false;
    }
  }
  return allIds;
}

export async function deleteCompanies() {
  const companyIds = await getAllCompanyIds();
  const totalToDelete = companyIds.length;

  if (totalToDelete === 0) {
    console.log("No companies to delete. Exiting.");
    return 0;
  }

  const BATCH_LIMIT = 50;
  let totalDeleted = 0;

  for (let i = 0; i < totalToDelete; i += BATCH_LIMIT) {
    const batchChunk = companyIds.slice(i, i + BATCH_LIMIT);
    const commands = {};

    batchChunk.forEach((id, index) => {
      commands[`c${index}`] = `crm.company.delete?id=${id}`;
    });

    try {
      const response = await apiClient.post("/batch", {
        halt: 0,
        cmd: commands,
      });

      const batchResult = response.data.result.result_time;
      const successfulDeletes = Object.keys(batchResult).length;
      totalDeleted += successfulDeletes;

      await sleep(500);
    } catch (err) {
      console.error(
        "Error executing batch delete:",
        err.response?.data || err.message
      );
    }
  }

  console.log(
    `Completed! Total companies deleted: ${totalDeleted} / ${totalToDelete}`
  );
  return totalDeleted;
}
