export default function mapCompany(company) {
  const phone = Array.isArray(company.PHONE)
    ? company.PHONE.map((p) => p.VALUE || p).join(", ")
    : "";

  const email = Array.isArray(company.EMAIL)
    ? company.EMAIL.map((e) => e.VALUE || e).join(", ")
    : "";

  const address = company.ADDRESS || (company.ADDRESS?.VALUE ?? null);

  const createdAt = company.DATE_CREATE || company.createdAt || null;

  return {
    id: company.ID,
    title: company.TITLE,
    phone,
    email,
    address,
    createdAt,
  };
}
