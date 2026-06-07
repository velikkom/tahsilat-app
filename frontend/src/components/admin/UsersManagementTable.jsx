"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, Spinner } from "react-bootstrap";
import {
  activateUser,
  deactivateUser,
  getAllUsers,
} from "@/services/userService";

function StatusBadge({ active, newUser }) {
  if (active) {
    return <span className="badge text-bg-success">Aktif</span>;
  }

  if (newUser) {
    return <span className="badge text-bg-warning">Onay Bekliyor</span>;
  }

  return <span className="badge text-bg-secondary">Pasif</span>;
}

export default function UsersManagementTable({ onUpdated }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState(null);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  async function handleActivate(userId) {
    try {
      setActionId(userId);
      await activateUser(userId);
      await loadUsers();
      onUpdated?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionId(null);
    }
  }

  async function handleDeactivate(userId) {
    try {
      setActionId(userId);
      await deactivateUser(userId);
      await loadUsers();
      onUpdated?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionId(null);
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" role="status" />
      </div>
    );
  }

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body">
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
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
                users.map((user) => {
                  const isBusy = actionId === user.id;
                  const fullName =
                    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
                    "-";

                  return (
                    <tr key={user.id}>
                      <td>{fullName}</td>
                      <td>{user.email}</td>
                      <td>{user.role?.replace("ROLE_", "")}</td>
                      <td>
                        <StatusBadge
                          active={user.active}
                          newUser={user.newUser}
                        />
                      </td>
                      <td className="text-end">
                        {user.active ? (
                          <Button
                            variant="outline-danger"
                            size="sm"
                            disabled={isBusy}
                            onClick={() => handleDeactivate(user.id)}
                          >
                            {isBusy ? "..." : "Pasifleştir"}
                          </Button>
                        ) : (
                          <Button
                            variant="outline-success"
                            size="sm"
                            disabled={isBusy}
                            onClick={() => handleActivate(user.id)}
                          >
                            {isBusy ? "..." : "Aktifleştir"}
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
