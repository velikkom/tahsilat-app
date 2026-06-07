import { getUserStatus } from "@/utils/userUtils";

const STATUS_CONFIG = {
  active: {
    label: "Aktif",
    className: "user-status-badge--active",
  },
  pending: {
    label: "Onay Bekliyor",
    className: "user-status-badge--pending",
  },
  inactive: {
    label: "Pasif",
    className: "user-status-badge--inactive",
  },
};

export default function UserStatusBadge({ user, className = "" }) {
  const status = getUserStatus(user);
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={`user-status-badge ${config.className} ${className}`.trim()}
    >
      <span className="user-status-badge__dot" aria-hidden />
      {config.label}
    </span>
  );
}
