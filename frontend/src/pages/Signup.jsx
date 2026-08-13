import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", address: "", password: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const { data } = await api.post("/auth/signup", form);
      setMessage(data.message);
      setTimeout(() => navigate("/login/user"), 900);
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed.");
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card wide">
        <button className="back-link" onClick={() => navigate("/")}>← Back</button>
        <div className="auth-icon">👤</div>
        <h1>Create User Account</h1>
        <p>Join StoreRate and start rating stores.</p>

        {message && <div className="alert success">{message}</div>}
        {error && <div className="alert error">{error}</div>}

        <form onSubmit={submit}>
          <label>Full Name <small>20–60 characters</small></label>
          <input required minLength="20" maxLength="60" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Enter your full name" />

          <label>Email</label>
          <input required type="email" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com" />

          <label>Address <small>max 400 characters</small></label>
          <textarea required maxLength="400" value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            placeholder="Your address" />

          <label>Password <small>8–16 chars, uppercase + special character</small></label>
          <input required type="password" minLength="8" maxLength="16" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Example: Rahul@123" />

          <button className="btn btn-primary full">Create account</button>
        </form>
      </div>
    </main>
  );
}
