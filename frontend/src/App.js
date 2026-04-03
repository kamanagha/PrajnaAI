import React from "react"; // ✅ Ensure React is imported
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import UploadMaterial from "./pages/UploadMaterial";
import ViewMaterials from "./pages/ViewMaterials";
import MaterialDetail from "./pages/MaterialDetail";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>

        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <UploadMaterial />
            </ProtectedRoute>
          }
        />

        {/* Materials */}
        <Route
          path="/materials"
          element={
            <ProtectedRoute>
              <ViewMaterials />
            </ProtectedRoute>
          }
        />

        {/* 🔥 Material Detail Page */}
        <Route
          path="/material/:id"
          element={
            <ProtectedRoute>
              <MaterialDetail />
            </ProtectedRoute>
          }
        />

        {/* 404 Page */}
        <Route
          path="*"
          element={
            <div className="text-center mt-5">
              <h2>404 - Page Not Found</h2>
            </div>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;