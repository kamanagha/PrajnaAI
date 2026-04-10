import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useTheme } from "../context/ThemeContext";

function Login() {
  const navigate = useNavigate();
  const { currentTheme, themes } = useTheme();
  const theme = themes[currentTheme];
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [popupMessage, setPopupMessage] = useState({ show: false, message: "", type: "" });

  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token") || localStorage.getItem("authToken");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  // Auto-hide popup after 3 seconds
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
    setError("");
  };

  const login = async () => {
    setError("");

    if (!email || !password) {
      showPopup("❌ Please fill all fields", "error");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showPopup("❌ Please enter a valid email address", "error");
      return;
    }

    try {
      setLoading(true);

      // POST to backend login
      const res = await axios.post(
        "http://127.0.0.1:8000/api/users/login/",
        { email, password }
      );

      // Store JWT tokens in localStorage
      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("authToken", res.data.access_token);
      localStorage.setItem("refresh_token", res.data.refresh_token);
      localStorage.setItem("user_id", res.data.user_id);
      localStorage.setItem("name", res.data.name);
      localStorage.setItem("user", JSON.stringify({
        id: res.data.user_id,
        name: res.data.name,
        email: email
      }));

      setLoading(false);
      showPopup("✅ Login successful! Redirecting to dashboard...", "success");

      // Dispatch custom event to notify navbar
      window.dispatchEvent(new Event("authChange"));
      window.dispatchEvent(new Event("storage"));

      // Redirect to dashboard after 1 second
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);

    } catch (err) {
      setLoading(false);

      // Clear password field for security
      setPassword("");

      // Handle specific error cases with clear messages
      if (err.response) {
        const status = err.response.status;
        const errorData = err.response.data;

        // Check for specific error messages
        if (errorData.error) {
          const errorMsg = errorData.error.toLowerCase();
          
          if (errorMsg.includes("email") || errorMsg.includes("not found") || errorMsg.includes("does not exist")) {
            showPopup("📧 Email not found! Please check your email address or register for a new account.", "error");
          } 
          else if (errorMsg.includes("password") || errorMsg.includes("incorrect") || errorMsg.includes("invalid")) {
            showPopup("🔐 Wrong password! Please check your password and try again.", "error");
          }
          else if (errorMsg.includes("credentials")) {
            showPopup("❌ Invalid credentials! Please check your email and password.", "error");
          }
          else {
            showPopup(`❌ ${errorData.error}`, "error");
          }
        } 
        else if (errorData.error) {
          const errorMsg = errorData.error.toLowerCase();
        
          if (errorMsg.includes("does not exist") || errorMsg.includes("not exist")) {
            showPopup("📧 Email not registered! Please create an account first.", "error");
          } 
          else if (errorMsg.includes("incorrect password")) {
            showPopup("🔐 Wrong password! Try again.", "error");
          }
          else {
            showPopup(`❌ ${errorData.error}`, "error");
          }
        }
        else if (status === 401) {
          showPopup("🔐 Invalid email or password. Please try again.", "error");
        } 
        else if (status === 404) {
          showPopup("📧 Email address not found. Please register for an account.", "error");
        }
        else if (status === 400) {
          showPopup("❌ Please provide valid email and password.", "error");
        }
        else {
          showPopup("❌ Login failed. Please try again.", "error");
        }
      } 
      else if (err.request) {
        showPopup("🌐 Network error! Please check your internet connection.", "error");
      } 
      else {
        showPopup("❌ Something went wrong. Please try again later.", "error");
      }
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      login();
    }
  };

  // Dynamic styles based on theme
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
          top: "20px",
          right: "20px",
          zIndex: 9999,
          animation: "slideInRight 0.5s ease-out"
        }}>
          <div style={{
            background: popupMessage.type === "success" 
              ? "linear-gradient(135deg, #28a745, #20c997)"
              : "linear-gradient(135deg, #dc3545, #c82333)",
            color: "white",
            padding: "1rem 1.5rem",
            borderRadius: "12px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            minWidth: "300px",
            maxWidth: "450px"
          }}>
            <span style={{ fontSize: "1.5rem" }}>
              {popupMessage.type === "success" ? "✅" : "⚠️"}
            </span>
            <span style={{ fontSize: "0.95rem", fontWeight: 500 }}>
              {popupMessage.message}
            </span>
            <button
              onClick={() => setPopupMessage({ show: false, message: "", type: "" })}
              style={{
                background: "none",
                border: "none",
                color: "white",
                cursor: "pointer",
                marginLeft: "auto",
                fontSize: "1.2rem"
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Decorative background elements */}
      <div style={{
        position: "fixed",
        top: "20%",
        left: "-10%",
        width: "500px",
        height: "500px",
        background: `radial-gradient(circle, ${theme.primary}14 0%, transparent 70%)`,
        borderRadius: "50%",
        filter: "blur(80px)",
        pointerEvents: "none",
        animation: "float 8s ease-in-out infinite"
      }}></div>
      <div style={{
        position: "fixed",
        bottom: "10%",
        right: "-5%",
        width: "400px",
        height: "400px",
        background: `radial-gradient(circle, ${theme.primary}0D 0%, transparent 70%)`,
        borderRadius: "50%",
        filter: "blur(60px)",
        pointerEvents: "none",
        animation: "float 10s ease-in-out infinite reverse"
      }}></div>
      
      {/* Animated particles */}
      <div className="particles">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>

      {/* Login Form Container */}
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
            background: theme.gradient,
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
            marginBottom: "0.5rem"
          }}>
            Welcome Back
          </h2>
          <p style={{
            color: `${theme.text}CC`,
            fontSize: "0.9rem"
          }}>
            Login to access your smart learning platform
          </p>
        </div>

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
                padding: "0.5rem",
                transition: "color 0.3s ease"
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = theme.primaryLight || theme.primary}
              onMouseLeave={(e) => e.currentTarget.style.color = theme.primary}
            >
              {showPassword ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>
        </div>

        {/* Forgot Password Link */}
        <div style={{
          textAlign: "right",
          marginBottom: "1.5rem"
        }}>
          <Link
            to="/forgot-password"
            style={{
              color: theme.primary,
              fontSize: "0.85rem",
              textDecoration: "none",
              transition: "all 0.3s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = theme.primaryLight || theme.primary;
              e.currentTarget.style.textDecoration = "underline";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = theme.primary;
              e.currentTarget.style.textDecoration = "none";
            }}
          >
            Forgot Password?
          </Link>
        </div>

        {/* Login Button */}
        <button
          onClick={login}
          disabled={loading}
          style={{
            ...styles.loginButton,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: loading ? "none" : `0 4px 15px ${theme.primary}4D`
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
              e.currentTarget.style.boxShadow = `0 4px 15px ${theme.primary}4D`;
            }
          }}
        >
          {loading ? (
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
              <span className="spinner"></span>
              Logging in...
            </span>
          ) : (
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
              🔓 Login
            </span>
          )}
        </button>

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
                e.currentTarget.style.color = theme.primaryLight || theme.primary;
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

        {/* Keyboard hint */}
        <div style={{
          textAlign: "center",
          marginTop: "1rem",
          padding: "0.75rem",
          background: `${theme.primary}0D`,
          borderRadius: "8px",
          border: `1px dashed ${theme.primary}33`
        }}>
          <p style={{ color: `${theme.text}99`, fontSize: "0.75rem", margin: 0 }}>
            💡 Press <kbd style={{
              background: `${theme.primary}33`,
              padding: "0.2rem 0.4rem",
              borderRadius: "4px",
              color: theme.primary,
              fontFamily: "monospace"
            }}>Enter</kbd> key to login
          </p>
        </div>
      </div>

      {/* CSS Animations */}
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

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(20px, -20px) rotate(5deg); }
          50% { transform: translate(-10px, 30px) rotate(-3deg); }
          75% { transform: translate(15px, -10px) rotate(2deg); }
        }

        @keyframes particleFloat {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 0.5;
          }
          90% {
            opacity: 0.5;
          }
          100% {
            transform: translateY(-100vh) translateX(20px);
            opacity: 0;
          }
        }

        @keyframes glowPulse {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
          }
        }

        .spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        input::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }

        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 30px #1a1a1a inset !important;
          -webkit-text-fill-color: #ffffff !important;
        }

        kbd {
          display: inline-block;
          padding: 0.2rem 0.4rem;
          font-size: 0.75rem;
          font-weight: 600;
          line-height: 1;
          border-radius: 4px;
        }

        /* Particles Animation */
        .particles {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
          z-index: 1;
        }

        .particle {
          position: absolute;
          bottom: -20px;
          width: 4px;
          height: 4px;
          background: ${theme.primary};
          border-radius: 50%;
          opacity: 0;
          animation: particleFloat 8s ease-in-out infinite;
        }

        .particle:nth-child(1) {
          left: 10%;
          width: 6px;
          height: 6px;
          animation-duration: 12s;
          animation-delay: 0s;
        }

        .particle:nth-child(2) {
          left: 25%;
          width: 3px;
          height: 3px;
          animation-duration: 10s;
          animation-delay: 2s;
        }

        .particle:nth-child(3) {
          left: 40%;
          width: 5px;
          height: 5px;
          animation-duration: 14s;
          animation-delay: 1s;
        }

        .particle:nth-child(4) {
          left: 60%;
          width: 4px;
          height: 4px;
          animation-duration: 9s;
          animation-delay: 3s;
        }

        .particle:nth-child(5) {
          left: 75%;
          width: 7px;
          height: 7px;
          animation-duration: 11s;
          animation-delay: 0.5s;
        }

        .particle:nth-child(6) {
          left: 90%;
          width: 3px;
          height: 3px;
          animation-duration: 13s;
          animation-delay: 1.5s;
        }

        /* Form input focus ring animation */
        input:focus {
          animation: glowPulse 1.5s ease-in-out infinite;
        }

        /* Button ripple effect */
        button {
          position: relative;
          overflow: hidden;
        }

        button::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          transform: translate(-50%, -50%);
          transition: width 0.6s, height 0.6s;
        }

        button:active::after {
          width: 300px;
          height: 300px;
        }
      `}</style>
    </div>
  );
}

export default Login;