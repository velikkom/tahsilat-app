import { useCallback, useEffect, useState } from "react";
import useRoles from "@/hooks/useRoles";
import {
  activateUser,
  deactivateUser,
  getAllUsers,
  updateUserRole,
} from "@/services/userService";

export default function useUsersManagement({ onUpdated }) {
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

  return {
    roles,
    users,
    loading,
    error,
    actionError,
    busy,
    selectedUser,
    drawerOpen,
    openDetail: (user) => {
      setActionError("");
      setSelectedUser(user);
      setDrawerOpen(true);
    },
    closeDetail: () => setDrawerOpen(false),
    handleActivate: (user) => runAction(() => activateUser(user.id)),
    handleDeactivate: (user) => runAction(() => deactivateUser(user.id)),
    handleUpdateRole: (user, role) =>
      runAction(() => updateUserRole(user.id, role)),
  };
}
