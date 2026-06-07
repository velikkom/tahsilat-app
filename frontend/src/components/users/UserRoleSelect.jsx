"use client";

import { Form } from "react-bootstrap";
import { formatRoleLabel } from "@/utils/userUtils";

export default function UserRoleSelect({
  roles = [],
  value,
  onChange,
  disabled = false,
  id = "user-role-select",
}) {
  return (
    <Form.Select
      id={id}
      value={value || ""}
      onChange={(event) => onChange?.(event.target.value)}
      disabled={disabled}
      className="user-role-select touch-target"
    >
      <option value="" disabled>
        Rol seçin
      </option>
      {roles.map((role) => (
        <option key={role.name} value={role.name}>
          {role.label || formatRoleLabel(role.name)}
        </option>
      ))}
    </Form.Select>
  );
}
