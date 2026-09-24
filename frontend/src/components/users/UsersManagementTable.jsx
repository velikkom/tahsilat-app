import { Button } from "react-bootstrap";
import UserStatusBadge from "@/components/users/UserStatusBadge";
import { formatRoleLabel, formatUserName } from "@/utils/userUtils";

export default function UsersManagementTable({ users, onDetail }) {
  return (
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
                    <td className="users-table__name">{formatUserName(user)}</td>
                    <td className="users-table__email text-break">{user.email}</td>
                    <td className="users-table__role">{formatRoleLabel(user.role)}</td>
                    <td>
                      <UserStatusBadge user={user} />
                    </td>
                    <td className="text-end">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="touch-target"
                        onClick={() => onDetail(user)}
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
  );
}
