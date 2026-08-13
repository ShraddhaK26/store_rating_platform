import React from "react";
import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Rating from "../../components/Rating";
import api from "../../services/api";
import { Link } from "react-router-dom";

export default function UserDashboard() {
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(null);

  async function load() {
    try {
      const { data } = await api.get(`/stores?search=${encodeURIComponent(search)}`);
      setStores(data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load stores.");
    }
  }

  useEffect(() => { load(); }, []);

  async function rate(storeId, rating) {
    setSaving(storeId);
    try {
      await api.post("/ratings", { storeId, rating });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save rating.");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="app-shell">
      <Navbar title="StoreRate • User" />
      <main className="dashboard">
        <div className="page-heading">
          <div>
            <div className="eyebrow">CUSTOMER AREA</div>
            <h1>Discover stores</h1>
            <p>Search stores, see ratings and submit your own 1–5 star rating.</p>
          </div>
          <Link className="btn btn-outline" to="/user/password">Change password</Link>
        </div>

        {error && <div className="alert error">{error}</div>}

        <div className="search-row">
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by store name or address..." />
          <button className="btn btn-primary" onClick={load}>Search</button>
        </div>

        <div className="store-grid">
          {stores.map((store) => (
            <article className="store-card" key={store.id}>
              <div className="store-top">
                <div>
                  <h2>{store.name}</h2>
                  <p>{store.address}</p>
                  <small>{store.email}</small>
                </div>
                <div className="score">
                  <strong>{Number(store.overallRating).toFixed(1)}</strong>
                  <span>overall</span>
                </div>
              </div>

              <div className="rating-section">
                <div>
                  <span className="muted">Your rating</span>
                  <Rating value={Number(store.userRating)} onChange={(v) => rate(store.id, v)} />
                </div>
                <span className="rating-note">
                  {saving === store.id ? "Saving..." : store.userRating ? "Click a star to update" : "Click a star to rate"}
                </span>
              </div>
            </article>
          ))}
        </div>

        {!stores.length && <div className="empty">No stores found.</div>}
      </main>
    </div>
  );
}
