"use client";

import { Button } from "react-bootstrap";

export default function UserActionButtons({
  user,
  busy = false,
  onActivate,
  onDeactivate,
  onUpdateRole,
  roleChanged = false,
}) {
  const isActive = Boolean(user?.active);

  return (
    <div className="user-action-buttons d-grid gap-2">
      {!isActive && (
        <Button
          variant="success"
          className="touch-target"
          disabled={busy}
          onClick={() => onActivate?.(user)}
        >
          Aktifleştir
        </Button>
      )}

      {isActive && (
        <Button
          variant="outline-danger"
          className="touch-target"
          disabled={busy}
          onClick={() => onDeactivate?.(user)}
        >
          Pasifleştir
        </Button>
      )}

      <Button
        variant="primary"
        className="touch-target"
        disabled={busy || !roleChanged}
        onClick={() => onUpdateRole?.(user)}
      >
        Rolü Güncelle
      </Button>
    </div>
  );
}
