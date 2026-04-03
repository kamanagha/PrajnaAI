import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

function Navbar() {
  const navigate = useNavigate();
  const { user, loading, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <nav style={{
        background: "rgba(0, 0, 0, 0.95)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(255, 140, 0, 0.3)",
        padding: "0.75rem 0",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)"
      }}>
        <div style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div style={{
            fontSize: "1.8rem",
            fontWeight: 800,
            background: "linear-gradient(135deg, #FF6B00, #FF8C00, #FFA500)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent"
          }}>
            PrajnaAI
          </div>
          <div style={{
            width: "180px",
            height: "40px",
            background: "rgba(255, 140, 0, 0.1)",
            borderRadius: "50px",
            animation: "pulse 1.5s ease-in-out infinite"
          }}></div>
        </div>
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 0.5; }
            50% { opacity: 1; }
          }
        `}</style>
      </nav>
    );
  }

  return (
    <nav style={{
      background: "rgba(0, 0, 0, 0.95)",
      backdropFilter: "blur(10px)",
      borderBottom: "1px solid rgba(255, 140, 0, 0.3)",
      padding: "0.75rem 0",
      position: "sticky",
      top: 0,
      zIndex: 1000,
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)"
    }}>
      <div style={{
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "0 1.5rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "1rem"
      }}>
        {/* Logo/Brand */}
        <Link 
          to="/" 
          style={{
            fontSize: "1.8rem",
            fontWeight: 800,
            background: "linear-gradient(135deg, #FF6B00, #FF8C00, #FFA500)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
            textDecoration: "none",
            letterSpacing: "-0.5px",
            transition: "all 0.3s ease",
            display: "inline-block"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          PrajnaAI
        </Link>

        {/* Right Section - Changes based on auth state */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          flexWrap: "wrap"
        }}>
          {isAuthenticated && user ? (
            <>
              {/* Welcome Message with Animation */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "rgba(255, 140, 0, 0.1)",
                padding: "0.5rem 1.2rem",
                borderRadius: "50px",
                border: "1px solid rgba(255, 140, 0, 0.3)",
                animation: "slideIn 0.5s ease-out"
              }}>
                <span style={{ fontSize: "1.2rem" }}>👋</span>
                <span style={{
                  color: "#FFA500",
                  fontSize: "0.95rem",
                  fontWeight: 500
                }}>
                  Welcome, <span style={{
                    fontWeight: 700,
                    color: "#FF8C00"
                  }}>{user}</span>
                </span>
              </div>

              {/* Dashboard Button */}
              <Link
                to="/dashboard"
                style={{
                  background: "linear-gradient(135deg, #FF6B00, #FF8C00)",
                  color: "white",
                  textDecoration: "none",
                  padding: "0.6rem 1.5rem",
                  borderRadius: "50px",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  transition: "all 0.3s ease",
                  border: "none",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  boxShadow: "0 2px 8px rgba(255, 107, 0, 0.3)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 4px 15px rgba(255, 107, 0, 0.5)";
                  e.currentTarget.style.background = "linear-gradient(135deg, #FF7B00, #FF9D00)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(255, 107, 0, 0.3)";
                  e.currentTarget.style.background = "linear-gradient(135deg, #FF6B00, #FF8C00)";
                }}
              >
                📊 Dashboard
              </Link>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                style={{
                  background: "rgba(0, 0, 0, 0.8)",
                  color: "#FF6B00",
                  textDecoration: "none",
                  padding: "0.6rem 1.5rem",
                  borderRadius: "50px",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  transition: "all 0.3s ease",
                  border: "1.5px solid #FF6B00",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  backgroundColor: "transparent"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 107, 0, 0.1)";
                  e.currentTarget.style.color = "#FF8C00";
                  e.currentTarget.style.borderColor = "#FF8C00";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(0, 0, 0, 0.8)";
                  e.currentTarget.style.color = "#FF6B00";
                  e.currentTarget.style.borderColor = "#FF6B00";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                🚪 Logout
              </button>
            </>
          ) : (
            <>
              {/* Login Button - Shows when NOT logged in */}
              <Link
                to="/login"
                style={{
                  background: "rgba(0, 0, 0, 0.8)",
                  color: "#FFA500",
                  textDecoration: "none",
                  padding: "0.6rem 1.5rem",
                  borderRadius: "50px",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  transition: "all 0.3s ease",
                  border: "1.5px solid #FF8C00",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 140, 0, 0.1)";
                  e.currentTarget.style.color = "#FFB347";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(0, 0, 0, 0.8)";
                  e.currentTarget.style.color = "#FFA500";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                🔑 Login
              </Link>

              {/* Register Button - Shows when NOT logged in */}
              <Link
                to="/register"
                style={{
                  background: "linear-gradient(135deg, #FF6B00, #FF8C00)",
                  color: "white",
                  textDecoration: "none",
                  padding: "0.6rem 1.5rem",
                  borderRadius: "50px",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  transition: "all 0.3s ease",
                  border: "none",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  boxShadow: "0 2px 8px rgba(255, 107, 0, 0.3)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 4px 15px rgba(255, 107, 0, 0.5)";
                  e.currentTarget.style.background = "linear-gradient(135deg, #FF7B00, #FF9D00)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(255, 107, 0, 0.3)";
                  e.currentTarget.style.background = "linear-gradient(135deg, #FF6B00, #FF8C00)";
                }}
              >
                📝 Register
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Add animation styles */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </nav>
  );
}

export default Navbar;