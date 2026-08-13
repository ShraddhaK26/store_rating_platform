import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

import UserDashboard from "./pages/user/UserDashboard";
import UserChangePassword from "./pages/user/ChangePassword";

import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageStores from "./pages/admin/ManageStores";
import AdminChangePassword from "./pages/admin/ChangePassword";

import OwnerDashboard from "./pages/owner/OwnerDashboard";
import OwnerChangePassword from "./pages/owner/ChangePassword";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login/:role" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route path="/user" element={<ProtectedRoute roles={["user"]}><UserDashboard /></ProtectedRoute>} />
      <Route path="/user/password" element={<ProtectedRoute roles={["user"]}><UserChangePassword /></ProtectedRoute>} />

      <Route path="/admin" element={<ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute roles={["admin"]}><ManageUsers /></ProtectedRoute>} />
      <Route path="/admin/stores" element={<ProtectedRoute roles={["admin"]}><ManageStores /></ProtectedRoute>} />
      <Route path="/admin/password" element={<ProtectedRoute roles={["admin"]}><AdminChangePassword /></ProtectedRoute>} />

      <Route path="/owner" element={<ProtectedRoute roles={["owner"]}><OwnerDashboard /></ProtectedRoute>} />
      <Route path="/owner/password" element={<ProtectedRoute roles={["owner"]}><OwnerChangePassword /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
