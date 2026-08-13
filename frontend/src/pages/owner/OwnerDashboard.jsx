import React from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import api from "../../services/api";

export default function OwnerDashboard() {
  const [data,setData]=useState({store:null,averageRating:0,ratings:[]});
  const [error,setError]=useState("");

  useEffect(()=>{
    api.get("/stores/owner/dashboard")
      .then(({data})=>setData(data))
      .catch(err=>setError(err.response?.data?.message || "Could not load dashboard."));
  },[]);

  return (
    <div className="app-shell">
      <Navbar title="StoreRate • Owner" />
      <main className="dashboard">
        <div className="page-heading">
          <div><div className="eyebrow">STORE OWNER</div><h1>Owner dashboard</h1><p>Monitor your store's customer ratings.</p></div>
          <Link className="btn btn-outline" to="/owner/password">Change password</Link>
        </div>
        {error && <div className="alert error">{error}</div>}

        {!data.store ? <div className="empty">No store is assigned to your owner account yet.</div> : (
          <>
            <div className="owner-hero">
              <div><span className="eyebrow">YOUR STORE</span><h2>{data.store.name}</h2><p>{data.store.address}</p><small>{data.store.email}</small></div>
              <div className="big-score"><strong>{Number(data.averageRating).toFixed(1)}</strong><span>Average rating</span></div>
            </div>
            <div className="panel">
              <h2>Customer ratings</h2>
              <div className="table-wrap inner"><table><thead><tr><th>User</th><th>Email</th><th>Rating</th><th>Updated</th></tr></thead>
              <tbody>{data.ratings.map((r,i)=><tr key={i}><td>{r.name}</td><td>{r.email}</td><td><span className="rating-number">{r.rating} / 5</span></td><td>{new Date(r.updated_at).toLocaleString()}</td></tr>)}</tbody></table></div>
              {!data.ratings.length && <div className="empty small">No customer ratings yet.</div>}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
