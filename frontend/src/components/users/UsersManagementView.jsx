"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, Spinner } from "react-bootstrap";
import UserCard from "@/components/users/UserCard";
import UserDetailDrawer from "@/components/users/UserDetailDrawer";
import UserStatusBadge from "@/components/users/UserStatusBadge";
import useRoles from "@/hooks/useRoles";
import {
  activateUser,
  deactivateUser,
  getAllUsers,
  updateUserRole,
} from "@/services/userService";
import { formatRoleLabel, formatUserName } from "@/utils/userUtils";

export default function UsersManagementView({ onUpdated }) {
  const { roles } = useRoles(true);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [busy, setBusy] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAllUsers();
      setUsers(data);
      setSelectedUser((current) =>
        current ? data.find((user) => user.id === current.id) || null : null
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  function openDetail(user) {
    setActionError("");
    setSelectedUser(user);
    setDrawerOpen(true);
  }

  function closeDetail() {
    setDrawerOpen(false);
  }

  async function runAction(action) {
    try {
      setBusy(true);
      setActionError("");
      const updatedUser = await action();
      setUsers((current) =>
        current.map((user) => (user.id === updatedUser.id ? updatedUser : user))
      );
      setSelectedUser(updatedUser);
      onUpdated?.();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function handleActivate(user) {
    return runAction(() => activateUser(user.id));
  }

  function handleDeactivate(user) {
    return runAction(() => deactivateUser(user.id));
  }

  function handleUpdateRole(user, role) {
    return runAction(() => updateUserRole(user.id, role));
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" role="status" />
      </div>
    );
  }

  return (
    <>
      <div className="users-management">
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="users-management__mobile d-md-none">
          {users.length === 0 ? (
            <div className="user-card user-card--empty text-center text-muted">
              Kullanıcı bulunamadı.
            </div>
          ) : (
            <div className="users-management__cards">
              {users.map((user) => (
                <UserCard key={user.id} user={user} onDetail={openDetail} />
              ))}
            </div>
          )}
        </div>

        <div className="users-management__desktop d-none d-md-block card border-0 shadow-sm">
          <div className="card-body">
            <div className="table-responsive overflow-x-auto users-table-wrapper">
              <table className="table table-hover align-middle mb-0 users-table">
                <thead>
                  <tr>
                    <th>Ad Soyad</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Durum</th>
                    <th className="text-end">İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center text-muted py-4">
                        Kullanıcı bulunamadı.
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id}>
                        <td className="users-table__name">
                          {formatUserName(user)}
                        </td>
                        <td className="users-table__email text-break">
                          {user.email}
                        </td>
                        <td className="users-table__role">
                          {formatRoleLabel(user.role)}
                        </td>
                        <td>
                          <UserStatusBadge user={user} />
                        </td>
                        <td className="text-end">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="touch-target"
                            onClick={() => openDetail(user)}
                          >
                            Detay
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <UserDetailDrawer
        show={drawerOpen}
        user={selectedUser}
        roles={roles}
        busy={busy}
        actionError={actionError}
        onHide={closeDetail}
        onActivate={handleActivate}
        onDeactivate={handleDeactivate}
        onUpdateRole={handleUpdateRole}
      />
    </>
  );
}
