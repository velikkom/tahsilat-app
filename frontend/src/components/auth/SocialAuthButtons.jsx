"use client";

import { FcGoogle } from "react-icons/fc";
import { FaFacebook, FaGithub } from "react-icons/fa";

const PROVIDERS = [
  {
    id: "google",
    label: "Google ile devam et",
    Icon: FcGoogle,
    iconClassName: "auth-social-btn__icon--google",
  },
  {
    id: "facebook",
    label: "Facebook ile devam et",
    Icon: FaFacebook,
    iconClassName: "auth-social-btn__icon--facebook",
  },
  {
    id: "github",
    label: "GitHub ile devam et",
    Icon: FaGithub,
    iconClassName: "auth-social-btn__icon--github",
  },
];

function handleProviderClick(providerId) {
  console.info("Coming soon", { provider: providerId });
}

export default function SocialAuthButtons() {
  return (
    <div className="auth-social-section">
      <div className="auth-divider" role="separator">
        <span>veya devam et</span>
      </div>

      <div className="auth-social-list">
        {PROVIDERS.map(({ id, label, Icon, iconClassName }) => (
          <button
            key={id}
            type="button"
            className="auth-social-btn"
            onClick={() => handleProviderClick(id)}
            aria-label={label}
          >
            <Icon
              className={`auth-social-btn__icon ${iconClassName}`}
              aria-hidden
            />
            <span className="auth-social-btn__label">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
