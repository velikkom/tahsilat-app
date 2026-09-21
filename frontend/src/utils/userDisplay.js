const ROLE_LABELS = {
  ROLE_ADMIN: "Yönetici",
  ROLE_SALESMAN: "Plasiyer",
  ROLE_ACCOUNTING: "Muhasebe",
};

export function roleLabel(role) {
  return ROLE_LABELS[role] || "Kullanıcı";
}

export function userDisplayName(user) {
  if (!user) {
    return "Hesap";
  }

  const name = `${user.firstName || ""} ${user.lastName || ""}`.trim();
  return name || user.email || "Hesap";
}

export function userInitials(user) {
  const first = (user?.firstName || "").trim();
  const last = (user?.lastName || "").trim();

  if (first || last) {
    return `${first.charAt(0)}${last.charAt(0)}`.toLocaleUpperCase("tr-TR");
  }

  return (user?.email || "H").charAt(0).toLocaleUpperCase("tr-TR");
}
