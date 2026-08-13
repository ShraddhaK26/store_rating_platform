import React from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import api from "../../services/api";

const empty = { name:"", email:"", address:"", ownerId:"" };

export default function ManageStores() {
  const [stores,setStores] = useState([]);
  const [owners,setOwners] = useState([]);
  const [form,setForm] = useState(empty);
  const [filters,setFilters] = useState({name:"",email:"",address:""});
  const [error,setError] = useState("");
  const [message,setMessage] = useState("");

  async function load() {
    try {
      const q = new URLSearchParams(filters).toString();
      const [{data:storesData},{data:ownersData}] = await Promise.all([
        api.get(`/stores/admin?${q}`),
        api.get("/stores/owners")
      ]);
      setStores(storesData); setOwners(ownersData);
    } catch(err) { setError(err.response?.data?.message || "Could not load stores."); }
  }

  useEffect(()=>{ load(); },[]);

  async function create(e) {
    e.preventDefault(); setError(""); setMessage("");
    try {
      const {data}=await api.post("/stores",form);
      setMessage(data.message); setForm(empty); load();
    } catch(err) { setError(err.response?.data?.message || "Could not create store."); }
  }

  return (
    <div className="app-shell">
      <Navbar title="StoreRate • Admin" />
      <main className="dashboard">
        <Link className="back-link" to="/admin">← Admin dashboard</Link>
        <div className="page-heading"><div><div className="eyebrow">ADMIN</div><h1>Manage stores</h1><p>Create stores and assign store owners.</p></div></div>
        {error && <div className="alert error">{error}</div>}
        {message && <div className="alert success">{message}</div>}

        <div className="panel">
          <h2>Create store</h2>
          <form className="form-grid" onSubmit={create}>
            <div><label>Store name (20–60)</label><input required minLength="20" maxLength="60" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div>
            <div><label>Store email</label><input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div>
            <div className="span-2"><label>Address (max 400)</label><textarea required maxLength="400" value={form.address} onChange={e=>setForm({...form,address:e.target.value})}/></div>
            <div><label>Store owner</label><select value={form.ownerId} onChange={e=>setForm({...form,ownerId:e.target.value})}><option value="">No owner</option>{owners.map(o=><option key={o.id} value={o.id}>{o.name} — {o.email}</option>)}</select></div>
            <button className="btn btn-primary">Create store</button>
          </form>
        </div>

        <div className="panel">
          <h2>Search stores</h2>
          <div className="filter-grid">
            <input placeholder="Store name" value={filters.name} onChange={e=>setFilters({...filters,name:e.target.value})}/>
            <input placeholder="Email" value={filters.email} onChange={e=>setFilters({...filters,email:e.target.value})}/>
            <input placeholder="Address" value={filters.address} onChange={e=>setFilters({...filters,address:e.target.value})}/>
            <button className="btn btn-primary" onClick={load}>Search</button>
          </div>
        </div>

        <div className="table-wrap">
          <table><thead><tr><th>Store</th><th>Email</th><th>Address</th><th>Owner</th><th>Rating</th></tr></thead>
          <tbody>{stores.map(s=><tr key={s.id}><td>{s.name}</td><td>{s.email}</td><td>{s.address}</td><td>{s.ownerName || "—"}</td><td>{Number(s.rating).toFixed(1)}</td></tr>)}</tbody></table>
        </div>
      </main>
    </div>
  );
}
