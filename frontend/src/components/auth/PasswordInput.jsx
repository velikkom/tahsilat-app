"use client";

import { FaEye, FaEyeSlash } from "react-icons/fa";
import usePasswordToggle from "@/hooks/usePasswordToggle";

export default function PasswordInput({
  id,
  label,
  placeholder = "••••••••",
  error,
  registration,
  autoComplete = "current-password",
}) {
  const { visible, toggle, inputType } = usePasswordToggle();

  return (
    <div className="auth-field">
      <label className="auth-field__label" htmlFor={id}>
        {label}
      </label>
      <div className="auth-input-wrapper">
        <input
          id={id}
          type={inputType}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`auth-input auth-input--with-toggle ${error ? "auth-input--error" : ""}`}
          {...registration}
        />
        <button
          type="button"
          className="auth-field__toggle"
          onClick={toggle}
          aria-label={visible ? "Şifreyi gizle" : "Şifreyi göster"}
        >
          {visible ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>
      {error && (
        <p className="auth-field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
