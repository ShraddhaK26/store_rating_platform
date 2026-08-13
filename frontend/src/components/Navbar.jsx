import React from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar({ title = "StoreRate" }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  }

  return (
    <header className="navbar">
      <div className="brand" onClick={() => navigate("/")}>
        <span className="brand-mark">S</span>
        <span>{title}</span>
      </div>

      <div className="nav-right">
        {user && <span className="welcome">Hi, {user.name}</span>}
        {user && <button className="btn btn-outline" onClick={logout}>Logout</button>}
      </div>
    </header>
  );
}
