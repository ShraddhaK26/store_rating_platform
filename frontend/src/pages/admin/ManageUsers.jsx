import React from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import api from "../../services/api";

const empty = { name:"", email:"", password:"", address:"", role:"user" };

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({name:"",email:"",address:"",role:""});
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    try {
      const q = new URLSearchParams(filters).toString();
      const { data } = await api.get(`/users?${q}`);
      setUsers(data);
    } catch (err) { setError(err.response?.data?.message || "Could not load users."); }
  }

  useEffect(() => { load(); }, []);

  async function create(e) {
    e.preventDefault(); setError(""); setMessage("");
    try {
      const { data } = await api.post("/users", form);
      setMessage(data.message); setForm(empty); load();
    } catch (err) { setError(err.response?.data?.message || "Could not create user."); }
  }

  return (
    <div className="app-shell">
      <Navbar title="StoreRate • Admin" />
      <main className="dashboard">
        <Link className="back-link" to="/admin">← Admin dashboard</Link>
        <div className="page-heading"><div><div className="eyebrow">ADMIN</div><h1>Manage users</h1><p>Search users and create new accounts.</p></div></div>
        {error && <div className="alert error">{error}</div>}
        {message && <div className="alert success">{message}</div>}

        <div className="panel">
          <h2>Create account</h2>
          <form className="form-grid" onSubmit={create}>
            <div><label>Name (20–60)</label><input required minLength="20" maxLength="60" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div>
            <div><label>Email</label><input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div>
            <div><label>Password</label><input required type="password" minLength="8" maxLength="16" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></div>
            <div><label>Role</label><select value={form.role} onChange={e=>setForm({...form,role:e.target.value})}><option value="user">User</option><option value="owner">Owner</option><option value="admin">Admin</option></select></div>
            <div className="span-2"><label>Address</label><input maxLength="400" value={form.address} onChange={e=>setForm({...form,address:e.target.value})}/></div>
            <button className="btn btn-primary">Create account</button>
          </form>
        </div>

        <div className="panel">
          <h2>Search users</h2>
          <div className="filter-grid">
            <input placeholder="Name" value={filters.name} onChange={e=>setFilters({...filters,name:e.target.value})}/>
            <input placeholder="Email" value={filters.email} onChange={e=>setFilters({...filters,email:e.target.value})}/>
            <input placeholder="Address" value={filters.address} onChange={e=>setFilters({...filters,address:e.target.value})}/>
            <select value={filters.role} onChange={e=>setFilters({...filters,role:e.target.value})}><option value="">All roles</option><option value="user">User</option><option value="owner">Owner</option><option value="admin">Admin</option></select>
            <button className="btn btn-primary" onClick={load}>Search</button>
          </div>
        </div>

        <div className="table-wrap">
          <table><thead><tr><th>Name</th><th>Email</th><th>Address</th><th>Role</th></tr></thead>
          <tbody>{users.map(u=><tr key={u.id}><td>{u.name}</td><td>{u.email}</td><td>{u.address}</td><td><span className="badge">{u.role}</span></td></tr>)}</tbody></table>
        </div>
      </main>
    </div>
  );
}
