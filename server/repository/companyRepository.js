import query from "./db.js";

export async function upsertCompanies(companies) {
  if (!companies?.length) return 0;

  const COLUMNS = ["id", "title", "phone", "email", "address", "created_at"];

  const placeholders = [];
  const values = [];
  let index = 1;
  for (const company of companies) {
    const pack = COLUMNS.map(() => `$${index++}`).join(", ");
    placeholders.push(`(${pack})`);

    values.push(
      company.id,
      company.title,
      company.phone,
      company.email,
      company.address,
      company.created_at
    );
  }

  const sql = `
    INSERT INTO companies (${COLUMNS.join(", ")})
    VALUES ${placeholders.join(",\n")}
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      phone = EXCLUDED.phone,
      email = EXCLUDED.email,
      address = EXCLUDED.address,
      created_at = EXCLUDED.created_at
  `;

  await query(sql, values);

  return companies.length;
}
