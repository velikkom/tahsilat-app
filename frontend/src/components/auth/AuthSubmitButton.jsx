"use client";

import { Spinner } from "react-bootstrap";

export default function AuthSubmitButton({ loading, children, disabled }) {
  return (
    <button
      type="submit"
      className="auth-btn"
      disabled={disabled || loading}
    >
      {loading && (
        <Spinner
          animation="border"
          role="status"
          className="auth-btn__spinner"
          aria-hidden="true"
        />
      )}
      {loading ? "Please wait..." : children}
    </button>
  );
}
