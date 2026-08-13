import React from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import api from "../../services/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/users/stats")
      .then(({data}) => setStats(data))
      .catch(err => setError(err.response?.data?.message || "Could not load statistics."));
  }, []);

  return (
    <div className="app-shell">
      <Navbar title="StoreRate • Admin" />
      <main className="dashboard">
        <div className="page-heading">
          <div>
            <div className="eyebrow">ADMINISTRATION</div>
            <h1>Platform dashboard</h1>
            <p>Manage users, stores and the overall rating platform.</p>
          </div>
          <Link className="btn btn-outline" to="/admin/password">Change password</Link>
        </div>

        {error && <div className="alert error">{error}</div>}

        <div className="stat-grid">
          <div className="stat-card"><span>Users</span><strong>{stats.totalUsers}</strong></div>
          <div className="stat-card"><span>Stores</span><strong>{stats.totalStores}</strong></div>
          <div className="stat-card"><span>Ratings</span><strong>{stats.totalRatings}</strong></div>
        </div>

        <div className="admin-actions">
          <Link to="/admin/users" className="action-card"><span>👥</span><h2>Manage Users</h2><p>Create users, admins and store owners.</p></Link>
          <Link to="/admin/stores" className="action-card"><span>🏪</span><h2>Manage Stores</h2><p>Create stores and assign owners.</p></Link>
        </div>
      </main>
    </div>
  );
}
