import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import useAuth from "../hooks/useAuth";

function Login() {
  const navigate = useNavigate();
  const { currentTheme, themes } = useTheme();
  const theme = themes[currentTheme];
  const { login, isAuthenticated, user } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [popupMessage, setPopupMessage] = useState({ show: false, message: "", type: "" });

  // Check if already logged in and redirect accordingly
  useEffect(() => {
    if (isAuthenticated && user) {
      const isStaff = localStorage.getItem("is_staff") === "true";
      const isSuperuser = localStorage.getItem("is_superuser") === "true";
      
      if (isStaff || isSuperuser) {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (popupMessage.show) {
      const timer = setTimeout(() => {
        setPopupMessage({ show: false, message: "", type: "" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [popupMessage.show]);

  const showPopup = (message, type) => {
    setPopupMessage({ show: true, message, type });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      showPopup("Please enter both email and password", "error");
      return;
    }

    try {
      setLoading(true);
      const result = await login(email, password);
      
      if (result.success) {
        showPopup("Login successful! Redirecting...", "success");
        
        // Get user role from localStorage
        const isStaff = localStorage.getItem("is_staff") === "true";
        const isSuperuser = localStorage.getItem("is_superuser") === "true";
        
        // Redirect based on role
        setTimeout(() => {
          if (isStaff || isSuperuser) {
            navigate("/admin");
          } else {
            navigate("/dashboard");
          }
        }, 1500);
      } else {
        showPopup(result.error || "Login failed. Please check your credentials.", "error");
      }
    } catch (error) {
      showPopup("An error occurred. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLogin(e);
    }
  };

  const styles = {
    container: {
      minHeight: "calc(100vh - 80px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: `linear-gradient(135deg, ${theme.background} 0%, ${theme.surface} 50%, ${theme.background} 100%)`,
      padding: "2rem 1.5rem",
      fontFamily: "'Poppins', 'Segoe UI', 'Montserrat', system-ui, sans-serif",
      position: "relative",
      transition: "all 0.3s ease"
    },
    formContainer: {
      maxWidth: "450px",
      width: "100%",
      background: "linear-gradient(135deg, rgba(0, 0, 0, 0.85), rgba(20, 20, 20, 0.95))",
      backdropFilter: "blur(10px)",
      borderRadius: "24px",
      padding: "2.5rem",
      border: `1px solid ${theme.primary}33`,
      boxShadow: `0 20px 40px rgba(0, 0, 0, 0.5), 0 0 20px ${theme.primary}1A`,
      position: "relative",
      zIndex: 2,
      animation: "fadeInUp 0.6s ease-out"
    },
    input: {
      width: "100%",
      padding: "0.9rem 1rem",
      background: "rgba(255, 255, 255, 0.05)",
      border: `1px solid ${theme.primary}4D`,
      borderRadius: "12px",
      color: "#ffffff",
      fontSize: "1rem",
      transition: "all 0.3s ease",
      outline: "none",
      fontFamily: "inherit"
    },
    loginButton: {
      width: "100%",
      padding: "0.9rem",
      background: theme.gradient,
      color: "white",
      border: "none",
      borderRadius: "12px",
      fontSize: "1rem",
      fontWeight: 600,
      transition: "all 0.3s ease",
      cursor: "pointer"
    }
  };

  return (
    <div style={styles.container}>
      {/* Popup Notification */}
      {popupMessage.show && (
        <div style={{
          position: "fixed",
          top: "90px",
          right: "20px",
          zIndex: 99999,
          animation: "slideInRight 0.5s ease-out, fadeOut 0.5s ease-out 2.5s forwards"
        }}>
          <div style={{
            background: popupMessage.type === "success" 
              ? "linear-gradient(135deg, #28a745, #20c997)"
              : "linear-gradient(135deg, #dc3545, #c82333)",
            color: "white",
            padding: "1rem 1.5rem",
            borderRadius: "12px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            minWidth: "320px"
          }}>
            <span style={{ fontSize: "1.5rem" }}>{popupMessage.type === "success" ? "✅" : "⚠️"}</span>
            <span>{popupMessage.message}</span>
            <button onClick={() => setPopupMessage({ show: false, message: "", type: "" })} style={{ background: "none", border: "none", color: "white", cursor: "pointer", marginLeft: "auto" }}>✕</button>
          </div>
        </div>
      )}

      {/* Decorative background */}
      <div style={{
        position: "fixed",
        top: "20%",
        left: "-10%",
        width: "500px",
        height: "500px",
        background: `radial-gradient(circle, ${theme.primary}14 0%, transparent 70%)`,
        borderRadius: "50%",
        filter: "blur(80px)",
        pointerEvents: "none"
      }}></div>
      <div style={{
        position: "fixed",
        bottom: "10%",
        right: "-5%",
        width: "400px",
        height: "400px",
        background: `radial-gradient(circle, ${theme.primary}0D 0%, transparent 70%)`,
        borderRadius: "50%",
        filter: "blur(80px)",
        pointerEvents: "none"
      }}></div>

      <div style={styles.formContainer}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{
            fontSize: "3rem",
            marginBottom: "0.5rem",
            animation: "bounce 2s ease-in-out infinite"
          }}>🔐</div>
          <h2 style={{
            fontSize: "2rem",
            fontWeight: 700,
            color: theme.text,
            marginBottom: "0.5rem"
          }}>
            Welcome Back
          </h2>
          <p style={{
            color: `${theme.text}CC`,
            fontSize: "0.9rem"
          }}>
            Login to access your learning dashboard
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin}>
          {/* Email Input */}
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{
              display: "block",
              color: theme.primary,
              marginBottom: "0.5rem",
              fontSize: "0.9rem",
              fontWeight: 500
            }}>
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              style={styles.input}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = theme.primary;
                e.currentTarget.style.boxShadow = `0 0 0 3px ${theme.primary}1A`;
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = `${theme.primary}4D`;
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
              }}
              autoComplete="email"
            />
          </div>

          {/* Password Input */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{
              display: "block",
              color: theme.primary,
              marginBottom: "0.5rem",
              fontSize: "0.9rem",
              fontWeight: 500
            }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                style={{
                  ...styles.input,
                  paddingRight: "3rem"
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = theme.primary;
                  e.currentTarget.style.boxShadow = `0 0 0 3px ${theme.primary}1A`;
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = `${theme.primary}4D`;
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                }}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: theme.primary,
                  cursor: "pointer",
                  fontSize: "1.1rem",
                  padding: "0.5rem"
                }}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.loginButton,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer"
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = `0 6px 20px ${theme.primary}4D`;
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }
            }}
          >
            {loading ? "Logging in..." : "🔑 Login"}
          </button>
        </form>

        {/* Register Link */}
        <div style={{
          textAlign: "center",
          marginTop: "1.5rem",
          paddingTop: "1.5rem",
          borderTop: `1px solid ${theme.primary}1A`
        }}>
          <p style={{ color: `${theme.text}CC`, fontSize: "0.9rem" }}>
            Don't have an account?{" "}
            <Link
              to="/register"
              style={{
                color: theme.primary,
                textDecoration: "none",
                fontWeight: 600,
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = theme.secondary;
                e.currentTarget.style.textDecoration = "underline";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = theme.primary;
                e.currentTarget.style.textDecoration = "none";
              }}
            >
              Register here
            </Link>
          </p>
        </div>

        {/* Demo Credentials Hint */}
        <div style={{
          textAlign: "center",
          marginTop: "1rem",
          padding: "0.75rem",
          background: `${theme.primary}0D`,
          borderRadius: "8px",
          border: `1px dashed ${theme.primary}33`
        }}>
          <p style={{ color: `${theme.text}99`, fontSize: "0.75rem", margin: 0 }}>
            💡 Demo: Use your registered email and password
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(100px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeOut {
          to { opacity: 0; visibility: hidden; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}

export default Login;