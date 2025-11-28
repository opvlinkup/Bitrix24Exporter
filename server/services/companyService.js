import { upsertCompanies } from "../repository/companyRepository.js";
import mapCompany from "../mappers/bitrixMapper.js";

export async function saveCompanies(rawCompanies) {
  const normalized = rawCompanies.map((company) => mapCompany(company));
  return await upsertCompanies(normalized);
}
