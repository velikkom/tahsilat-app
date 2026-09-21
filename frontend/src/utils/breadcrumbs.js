const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const SECTION_LABELS = {
  dashboard: "Ana Sayfa",
  customers: "Müşteriler",
  collections: "Tahsilatlar",
  trips: "Turlar",
  users: "Kullanıcılar",
  profile: "Profil",
};

export function breadcrumbsFor(pathname, extraLabels = {}) {
  const parts = String(pathname || "")
    .split("/")
    .filter(Boolean);

  if (parts.length === 0) {
    return [{ href: "/dashboard", label: "Ana Sayfa", current: true }];
  }

  const crumbs = [];
  let href = "";

  for (let index = 0; index < parts.length; index += 1) {
    const part = parts[index];
    href += `/${part}`;
    const previous = parts[index - 1];

    if (part === "admin") {
      continue;
    }

    if (part === "new") {
      crumbs.push({ href, label: "Yeni Tur" });
      continue;
    }

    if (part === "print") {
      crumbs.push({ href, label: "Döküm" });
      continue;
    }

    if (UUID.test(part)) {
      if (previous === "customers") {
        crumbs.push({ href, label: extraLabels[href] || "Detay" });
      } else if (previous === "trips") {
        crumbs.push({ href, label: "Düzenle" });
      }
      continue;
    }

    const label = SECTION_LABELS[part];

    if (label) {
      crumbs.push({ href, label });
    }
  }

  if (crumbs.length === 0) {
    crumbs.push({ href: "/dashboard", label: "Ana Sayfa" });
  }

  return crumbs.map((crumb, index) => ({
    ...crumb,
    current: index === crumbs.length - 1,
  }));
}
