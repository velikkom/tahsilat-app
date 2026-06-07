"use client";

import { useEffect, useState } from "react";
import Offcanvas from "react-bootstrap/Offcanvas";
import UserStatusBadge from "./UserStatusBadge";
import UserRoleSelect from "./UserRoleSelect";
import UserActionButtons from "./UserActionButtons";
import { formatRoleLabel, formatUserName } from "@/utils/userUtils";

function DetailField({ label, children }) {
  return (
    <div className="user-detail-field">
      <span className="user-detail-field__label">{label}</span>
      <div className="user-detail-field__value">{children}</div>
    </div>
  );
}

export default function UserDetailDrawer({
  show,
  user,
  roles = [],
  busy = false,
  actionError = "",
  onHide,
  onActivate,
  onDeactivate,
  onUpdateRole,
}) {
  const [selectedRole, setSelectedRole] = useState("");
  const [placement, setPlacement] = useState("end");

  useEffect(() => {
    setSelectedRole(user?.role || "");
  }, [user]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");

    function updatePlacement() {
      setPlacement(mediaQuery.matches ? "bottom" : "end");
    }

    updatePlacement();
    mediaQuery.addEventListener("change", updatePlacement);

    return () => mediaQuery.removeEventListener("change", updatePlacement);
  }, []);

  if (!user) {
    return null;
  }

  const roleChanged = selectedRole !== user.role;

  return (
    <Offcanvas
      show={show}
      onHide={onHide}
      placement={placement}
      className={`user-detail-drawer ${placement === "bottom" ? "user-detail-drawer--bottom" : ""}`}
    >
      <Offcanvas.Header closeButton className="border-bottom">
        <Offcanvas.Title>Kullanıcı Detayı</Offcanvas.Title>
      </Offcanvas.Header>

      <Offcanvas.Body className="d-flex flex-column gap-4">
        {actionError && (
          <div className="alert alert-danger mb-0" role="alert">
            {actionError}
          </div>
        )}

        <div className="user-detail-fields">
          <DetailField label="Ad Soyad">{formatUserName(user)}</DetailField>
          <DetailField label="Email">
            <a href={`mailto:${user.email}`} className="text-break">
              {user.email}
            </a>
          </DetailField>
          <DetailField label="Rol">
            <UserRoleSelect
              roles={roles}
              value={selectedRole}
              onChange={setSelectedRole}
              disabled={busy}
            />
            <small className="text-muted d-block mt-1">
              Mevcut: {formatRoleLabel(user.role)}
            </small>
          </DetailField>
          <DetailField label="Durum">
            <UserStatusBadge user={user} />
          </DetailField>
        </div>

        <UserActionButtons
          user={user}
          busy={busy}
          roleChanged={roleChanged}
          onActivate={onActivate}
          onDeactivate={onDeactivate}
          onUpdateRole={() => onUpdateRole?.(user, selectedRole)}
        />
      </Offcanvas.Body>
    </Offcanvas>
  );
}
