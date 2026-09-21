"use client";

import { logout } from "@/services/authService";
import useCurrentUser from "@/hooks/useCurrentUser";
import { roleLabel, userDisplayName, userInitials } from "@/utils/userDisplay";

export default function ProfileView() {
  const { user, loading, error } = useCurrentUser();
  const name = userDisplayName(user);
  const initials = userInitials(user);

  async function handleLogout() {
    await logout();
    window.location.href = "/login";
  }

  return (
    <div className="profile-page d-flex flex-column gap-3 gap-md-4">
      <div>
        <h1 className="fw-bold page-header__title mb-1">Profil</h1>
        <p className="text-muted mb-0">Hesap bilgilerin ve oturum ayarların.</p>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border" role="status" />
        </div>
      ) : null}

      {error ? <div className="alert alert-danger mb-0">{error}</div> : null}

      {!loading && user ? (
        <>
          <section className="card border-0 shadow-sm profile-card">
            <div className="card-body p-4">
              <div className="d-flex align-items-center gap-3 pb-3 mb-1">
                <span className="app-profile-avatar app-profile-avatar--xl" aria-hidden>
                  {initials}
                </span>
                <div className="min-width-0">
                  <h2 className="h5 fw-bold mb-1 text-truncate">{name}</h2>
                  <div className="app-profile-menu__badge">{roleLabel(user.role)}</div>
                </div>
              </div>

              <dl className="profile-card__fields mb-0">
                <div>
                  <dt>Ad soyad</dt>
                  <dd>{name}</dd>
                </div>
                <div>
                  <dt>E-posta</dt>
                  <dd>{user.email || "—"}</dd>
                </div>
                <div>
                  <dt>Rol</dt>
                  <dd>{roleLabel(user.role)}</dd>
                </div>
                <div>
                  <dt>Durum</dt>
                  <dd>{user.active === false ? "Pasif" : "Aktif"}</dd>
                </div>
              </dl>
            </div>
          </section>

          <section className="card border-0 shadow-sm profile-card">
            <div className="card-body p-4">
              <h2 className="h6 fw-bold mb-1">Oturum</h2>
              <p className="text-muted small mb-3">
                Bu cihazdaki oturumu kapatarak güvenli şekilde çıkış yapabilirsin.
              </p>
              <button
                type="button"
                className="btn btn-outline-danger"
                onClick={handleLogout}
              >
                Çıkış yap
              </button>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
