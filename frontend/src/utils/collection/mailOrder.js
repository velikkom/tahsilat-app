export function toTurkishUpperCase(value) {
  return (value || "").toLocaleUpperCase("tr-TR");
}

export function mailOrderCompanyKey(value) {
  return toTurkishUpperCase(value).trim().replaceAll("İ", "I");
}

export function isKnownMailOrderCompany(name, companies = []) {
  const key = mailOrderCompanyKey(name);

  if (!key) {
    return false;
  }

  return companies.some((company) => mailOrderCompanyKey(company) === key);
}

export function filterMailOrderCompanies(companies = [], query) {
  const normalizedQuery = mailOrderCompanyKey(query);

  if (!normalizedQuery) {
    return companies;
  }

  const startsWith = companies.filter((company) =>
    mailOrderCompanyKey(company).startsWith(normalizedQuery)
  );

  if (startsWith.length > 0) {
    return startsWith;
  }

  return companies.filter((company) =>
    mailOrderCompanyKey(company).includes(normalizedQuery)
  );
}
