"use client";

export default function AuthInput({
  id,
  label,
  type = "text",
  placeholder,
  icon: Icon,
  error,
  registration,
  autoComplete,
}) {
  return (
    <div className="auth-field">
      <label className="auth-field__label" htmlFor={id}>
        {label}
      </label>
      <div className="auth-input-wrapper">
        {Icon && <Icon className="auth-input-wrapper__icon" aria-hidden />}
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`auth-input ${error ? "auth-input--error" : ""}`}
          {...registration}
        />
      </div>
      {error && (
        <p className="auth-field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
