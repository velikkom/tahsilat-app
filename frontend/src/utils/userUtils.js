export function formatUserName(user) {
  if (!user) {
    return "-";
  }

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");
  return fullName || "-";
}

export function formatRoleLabel(role) {
  if (!role) {
    return "-";
  }

  return role.replace(/^ROLE_/, "").replaceAll("_", " ");
}

export function getUserStatus(user) {
  if (user?.active) {
    return "active";
  }

  if (user?.newUser) {
    return "pending";
  }

  return "inactive";
}
