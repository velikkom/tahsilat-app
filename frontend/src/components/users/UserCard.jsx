"use client";

import { Button } from "react-bootstrap";
import UserStatusBadge from "./UserStatusBadge";
import { formatUserName } from "@/utils/userUtils";

export default function UserCard({ user, onDetail }) {
  return (
    <article className="user-card">
      <div className="user-card__header">
        <h3 className="user-card__name">{formatUserName(user)}</h3>
        <UserStatusBadge user={user} />
      </div>

      <a
        href={`mailto:${user.email}`}
        className="user-card__email text-break"
      >
        {user.email}
      </a>

      <Button
        variant="outline-primary"
        className="user-card__detail-btn touch-target w-100"
        onClick={() => onDetail?.(user)}
      >
        Detay
      </Button>
    </article>
  );
}
