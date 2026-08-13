import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ roles, children }) {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!user) return <Navigate to="/" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
}
