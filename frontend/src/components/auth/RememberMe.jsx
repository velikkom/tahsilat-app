"use client";

export default function RememberMe({ checked, onChange, id = "remember-me" }) {
  return (
    <label className="auth-remember" htmlFor={id}>
      <input
        id={id}
        type="checkbox"
        className="auth-remember__checkbox"
        checked={checked}
        onChange={onChange}
      />
      <span className="auth-remember__label">Remember Me</span>
    </label>
  );
}
