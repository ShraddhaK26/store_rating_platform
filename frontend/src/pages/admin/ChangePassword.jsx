import React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import api from "../../services/api";

export default function ChangePassword() {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError(""); setMessage("");
    try {
      const { data } = await api.put("/users/change-password", form);
      setMessage(data.message);
      setForm({ currentPassword: "", newPassword: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Could not change password.");
    }
  }

  return (
    <div className="app-shell">
      <Navbar title="StoreRate • Admin" />
      <main className="dashboard narrow">
        <Link className="back-link" to="/admin">← Back to dashboard</Link>
        <div className="panel">
          <div className="eyebrow">SECURITY</div>
          <h1>Change password</h1>
          {message && <div className="alert success">{message}</div>}
          {error && <div className="alert error">{error}</div>}
          <form onSubmit={submit}>
            <label>Current password</label>
            <input type="password" required value={form.currentPassword}
              onChange={(e) => setForm({...form,currentPassword:e.target.value})} />
            <label>New password</label>
            <input type="password" required minLength="8" maxLength="16" value={form.newPassword}
              onChange={(e) => setForm({...form,newPassword:e.target.value})} />
            <button className="btn btn-primary full">Update password</button>
          </form>
        </div>
      </main>
    </div>
  );
}
