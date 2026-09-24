"use client";

import { Spinner } from "react-bootstrap";
import UserDetailDrawer from "@/components/users/UserDetailDrawer";
import UsersManagementCards from "./UsersManagementCards";
import UsersManagementTable from "./UsersManagementTable";
import useUsersManagement from "./useUsersManagement";

export default function UsersManagementView({ onUpdated }) {
  const usersState = useUsersManagement({ onUpdated });

  if (usersState.loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" role="status" />
      </div>
    );
  }

  return (
    <>
      <div className="users-management">
        {usersState.error && (
          <div className="alert alert-danger">{usersState.error}</div>
        )}
        <div className="users-management__mobile d-md-none">
          <UsersManagementCards
            users={usersState.users}
            onDetail={usersState.openDetail}
          />
        </div>
        <UsersManagementTable
          users={usersState.users}
          onDetail={usersState.openDetail}
        />
      </div>
      <UserDetailDrawer
        show={usersState.drawerOpen}
        user={usersState.selectedUser}
        roles={usersState.roles}
        busy={usersState.busy}
        actionError={usersState.actionError}
        onHide={usersState.closeDetail}
        onActivate={usersState.handleActivate}
        onDeactivate={usersState.handleDeactivate}
        onUpdateRole={usersState.handleUpdateRole}
      />
    </>
  );
}
