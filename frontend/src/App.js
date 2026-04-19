import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider } from "./context/ThemeContext";

import Navbar from "./components/Navbar";
import Chatbot from "./components/Chatbot";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import UploadMaterial from "./pages/UploadMaterial";
import ViewMaterials from "./pages/ViewMaterials";
import MaterialDetail from "./pages/MaterialDetail";
import Analytics from "./pages/Analytics";
import StudyGroups from "./pages/StudyGroups";
import DiscussionForum from "./pages/DiscussionForum";

import ProtectedRoute from "./components/ProtectedRoute";

import AdminDashboard from "./pages/AdminDashboard";


function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Navbar />
        
        <div style={{ 
          minHeight: '100vh', 
          position: 'relative', 
          zIndex: 1,
          backgroundColor: 'var(--background-color)',
          transition: 'all 0.3s ease'
        }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

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

            <Route
              path="/materials"
              element={
                <ProtectedRoute>
                  <ViewMaterials />
                </ProtectedRoute>
              }
            />

            <Route
              path="/material/:id"
              element={
                <ProtectedRoute>
                  <MaterialDetail />
                </ProtectedRoute>
              }
            />

            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              }
            />

            <Route path="/study-groups" element={
              <ProtectedRoute>
                <StudyGroups />  
              </ProtectedRoute>
            } />

            <Route path="/discussion-forum" element={
              <ProtectedRoute>
                <DiscussionForum />
              </ProtectedRoute>
            } />

            <Route
              path="*"
              element={
                <div style={{ textAlign: 'center', marginTop: '48px' }}>
                  <h2 style={{ color: 'var(--primary-color)' }}>404 - Page Not Found</h2>
                  <p style={{ color: 'var(--text-color)', marginTop: '8px' }}>
                    The page you're looking for doesn't exist.
                  </p>
                </div>
              }
            />
          </Routes>
        </div>
        
        <Chatbot />
        
        {/* Toast Container for popup messages - positioned above navbar */}
        <ToastContainer 
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
          style={{ zIndex: 9999 }}
          toastStyle={{ 
            marginTop: '80px',
            zIndex: 9999,
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
          }}
        />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;