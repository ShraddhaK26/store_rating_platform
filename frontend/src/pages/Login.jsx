import React from "react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

const labels = {
  user: { title: "User Login", icon: "👤", subtitle: "Sign in to discover and rate stores." },
  admin: { title: "Admin Login", icon: "⚙", subtitle: "Sign in to manage the platform." },
  owner: { title: "Owner Login", icon: "🏪", subtitle: "Sign in to manage your store ratings." }
};

export default function Login() {
  const { role } = useParams();
  const navigate = useNavigate();
  const info = labels[role] || labels.user;

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", { ...form, role });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate(
        data.user.role === "admin" ? "/admin" :
        data.user.role === "owner" ? "/owner" : "/user"
      );
    } catch (err) {
      setError(err.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <button className="back-link" onClick={() => navigate("/")}>← Back to roles</button>
        <div className="auth-icon">{info.icon}</div>
        <h1>{info.title}</h1>
        <p>{info.subtitle}</p>

        {error && <div className="alert error">{error}</div>}

        <form onSubmit={submit}>
          <label>Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
          />

          <label>Password</label>
          <input
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••"
          />

          <button className="btn btn-primary full" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {role === "user" && (
          <p className="auth-footer">
            Don't have an account? <button onClick={() => navigate("/signup")}>Sign up</button>
          </p>
        )}

        <div className="demo-box">
          <strong>Demo {role}</strong>
          <span>{role === "user" ? "Create an account from Signup" : "admin@example.com / Admin@123"}</span>
          {role === "owner" && <span>Owner demo: owner@example.com / Admin@123</span>}
        </div>
      </div>
    </main>
  );
}
