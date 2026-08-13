import React from "react";
import { useNavigate } from "react-router-dom";

const roles = [
  { key: "user", icon: "👤", title: "User", text: "Discover stores and rate your experience." },
  { key: "admin", icon: "⚙", title: "Admin", text: "Manage users, owners, stores and platform data." },
  { key: "owner", icon: "🏪", title: "Owner", text: "Monitor your store and customer ratings." }
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <main className="landing">
      <div className="landing-glow glow-one" />
      <div className="landing-glow glow-two" />

      <section className="hero">
        <div className="eyebrow">STORE RATING PLATFORM</div>
        <h1>Rate it. Review it.<br /><span>Discover it.</span></h1>
        <p className="hero-text">
          A simple platform for customers, administrators and store owners
          to manage trusted store ratings.
        </p>

        <div className="role-grid">
          {roles.map((role) => (
            <button
              className="role-card"
              key={role.key}
              onClick={() => navigate(`/login/${role.key}`)}
            >
              <div className="role-icon">{role.icon}</div>
              <h2>{role.title}</h2>
              <p>{role.text}</p>
              <span className="role-link">Continue →</span>
            </button>
          ))}
        </div>

        <p className="signup-line">
          New customer?{" "}
          <button onClick={() => navigate("/signup")}>Create a user account</button>
        </p>
      </section>
    </main>
  );
}
