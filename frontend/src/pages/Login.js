import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

function Login() {
  const navigate = useNavigate();
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

  return (
    <div style={{
      minHeight: "calc(100vh - 80px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0d0d0d 100%)",
      padding: "2rem 1.5rem",
      fontFamily: "'Poppins', 'Segoe UI', 'Montserrat', system-ui, sans-serif",
      position: "relative"
    }}>
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
        background: "radial-gradient(circle, rgba(255, 94, 0, 0.1) 0%, transparent 70%)",
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
        background: "radial-gradient(circle, rgba(255, 140, 0, 0.08) 0%, transparent 70%)",
        borderRadius: "50%",
        filter: "blur(60px)",
        pointerEvents: "none"
      }}></div>

      {/* Login Form Container */}
      <div style={{
        maxWidth: "450px",
        width: "100%",
        background: "linear-gradient(135deg, rgba(0, 0, 0, 0.85), rgba(20, 20, 20, 0.95))",
        backdropFilter: "blur(10px)",
        borderRadius: "24px",
        padding: "2.5rem",
        border: "1px solid rgba(255, 140, 0, 0.2)",
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(255, 107, 0, 0.1)",
        position: "relative",
        zIndex: 2,
        animation: "fadeInUp 0.6s ease-out"
      }}>
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
            background: "linear-gradient(135deg, #FF6B00, #FF8C00, #FFA500)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
            marginBottom: "0.5rem"
          }}>
            Welcome Back
          </h2>
          <p style={{
            color: "#a0a0a0",
            fontSize: "0.9rem"
          }}>
            Login to access your smart learning platform
          </p>
        </div>

        {/* Email Input */}
        <div style={{ marginBottom: "1.25rem" }}>
          <label style={{
            display: "block",
            color: "#FFA500",
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
            style={{
              width: "100%",
              padding: "0.9rem 1rem",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 140, 0, 0.3)",
              borderRadius: "12px",
              color: "#ffffff",
              fontSize: "1rem",
              transition: "all 0.3s ease",
              outline: "none",
              fontFamily: "inherit"
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#FF8C00";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(255, 140, 0, 0.1)";
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "rgba(255, 140, 0, 0.3)";
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
            color: "#FFA500",
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
                width: "100%",
                padding: "0.9rem 1rem",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 140, 0, 0.3)",
                borderRadius: "12px",
                color: "#ffffff",
                fontSize: "1rem",
                transition: "all 0.3s ease",
                outline: "none",
                paddingRight: "3rem",
                fontFamily: "inherit"
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#FF8C00";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(255, 140, 0, 0.1)";
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(255, 140, 0, 0.3)";
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
                color: "#FFA500",
                cursor: "pointer",
                fontSize: "1.1rem",
                padding: "0.5rem",
                transition: "color 0.3s ease"
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = "#FF8C00"}
              onMouseLeave={(e) => e.currentTarget.style.color = "#FFA500"}
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
              color: "#FF8C00",
              fontSize: "0.85rem",
              textDecoration: "none",
              transition: "all 0.3s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#FFA500";
              e.currentTarget.style.textDecoration = "underline";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#FF8C00";
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
            width: "100%",
            padding: "0.9rem",
            background: loading 
              ? "linear-gradient(135deg, #555, #666)"
              : "linear-gradient(135deg, #FF6B00, #FF8C00)",
            color: "white",
            border: "none",
            borderRadius: "12px",
            fontSize: "1rem",
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            transition: "all 0.3s ease",
            boxShadow: loading ? "none" : "0 4px 15px rgba(255, 107, 0, 0.3)",
            opacity: loading ? 0.7 : 1
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(255, 107, 0, 0.4)";
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 15px rgba(255, 107, 0, 0.3)";
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
          borderTop: "1px solid rgba(255, 140, 0, 0.1)"
        }}>
          <p style={{ color: "#a0a0a0", fontSize: "0.9rem" }}>
            Don't have an account?{" "}
            <Link
              to="/register"
              style={{
                color: "#FF8C00",
                textDecoration: "none",
                fontWeight: 600,
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#FFA500";
                e.currentTarget.style.textDecoration = "underline";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#FF8C00";
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
          background: "rgba(255, 140, 0, 0.05)",
          borderRadius: "8px",
          border: "1px dashed rgba(255, 140, 0, 0.2)"
        }}>
          <p style={{ color: "#888", fontSize: "0.75rem", margin: 0 }}>
            💡 Press <kbd style={{
              background: "rgba(255, 140, 0, 0.2)",
              padding: "0.2rem 0.4rem",
              borderRadius: "4px",
              color: "#FFA500",
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
          color: #FFA500;
          background-color: rgba(255, 140, 0, 0.2);
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}

export default Login;