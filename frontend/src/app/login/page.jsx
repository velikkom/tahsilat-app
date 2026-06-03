"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login, saveToken } from "@/services/authService";
export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();

    try {
      setLoading(true);

      setError("");

      const data =
      await login(
          email,
          password
      );
  
  saveToken(
      data.accessToken
  );
  
  router.push(
      '/dashboard'
  );
    } catch (err) {
      setError("Email or password incorrect");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="
                min-vh-100
                d-flex
                align-items-center
                justify-content-center
                bg-light
            "
    >
      <div
        className="
                    card
                    shadow-lg
                    border-0
                    p-4
                "
        style={{
          width: "420px",
          borderRadius: "18px",
        }}
      >
        <div className="text-center mb-4">
          <h2
            className="
                            fw-bold
                            mb-2
                        "
          >
            Tahsilat ERP
          </h2>

          <p
            className="
                            text-muted
                            mb-0
                        "
          >
            Login to continue
          </p>
        </div>

        {error && (
          <div
            className="
                                alert
                                alert-danger
                            "
          >
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label
              className="
                                form-label
                            "
            >
              Email
            </label>

            <input
              type="email"
              className="
                                form-control
                                form-control-lg
                            "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label
              className="
                                form-label
                            "
            >
              Password
            </label>

            <input
              type="password"
              className="
                                form-control
                                form-control-lg
                            "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="
                            btn
                            btn-dark
                            w-100
                            py-3
                        "
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
