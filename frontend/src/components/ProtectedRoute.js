import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

function ProtectedRoute({ children, requireAdmin = false }) {
  const { isAuthenticated, loading, user } = useAuth();
  
  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "#0a0a0a"
      }}>
        <div className="spinner"></div>
        <style>{`
          .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(255, 107, 0, 0.3);
            border-top: 3px solid #FF6B00;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (requireAdmin) {
    const isStaff = localStorage.getItem("is_staff") === "true";
    const isSuperuser = localStorage.getItem("is_superuser") === "true";
    if (!isStaff && !isSuperuser) {
      return <Navigate to="/dashboard" />;
    }
  }
  
  return children;
}

export default ProtectedRoute;