import UserCard from "@/components/users/UserCard";

export default function UsersManagementCards({ users, onDetail }) {
  if (users.length === 0) {
    return (
      <div className="user-card user-card--empty text-center text-muted">
        Kullanıcı bulunamadı.
      </div>
    );
  }

  return (
    <div className="users-management__cards">
      {users.map((user) => (
        <UserCard key={user.id} user={user} onDetail={onDetail} />
      ))}
    </div>
  );
}
