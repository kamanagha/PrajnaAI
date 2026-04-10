import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useTheme } from "../context/ThemeContext";

function Register() {
  const navigate = useNavigate();
  const { currentTheme, themes } = useTheme();
  const theme = themes[currentTheme];

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
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
    setSuccess("");
  };

  // Calculate password strength
  const calculatePasswordStrength = (pass) => {
    let strength = 0;
    if (pass.length >= 6) strength++;
    if (pass.length >= 10) strength++;
    if (/[A-Z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;
    if (/[^A-Za-z0-9]/.test(pass)) strength++;
    return strength;
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordStrength(calculatePasswordStrength(newPassword));
  };

  const register = async () => {
    setError("");
    setSuccess("");

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      showPopup("All fields are required", "error");
      return;
    }

    if (name.length < 2) {
      showPopup("Name must be at least 2 characters", "error");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showPopup("Please enter a valid email address", "error");
      return;
    }

    if (password.length < 6) {
      showPopup("Password must be at least 6 characters", "error");
      return;
    }

    if (password !== confirmPassword) {
      showPopup("Passwords do not match", "error");
      return;
    }

    try {
      setLoading(true);

      // POST to backend register endpoint
      const res = await axios.post(
        "http://127.0.0.1:8000/api/users/register/",
        { name, email, password }
      );

      setLoading(false);
      setSuccess(res.data.message || "Registration successful! Redirecting to login...");
      showPopup(res.data.message || "Registration successful! ✅", "success");

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err) {
      setLoading(false);
    
      console.log("ERROR:", err.response);
    
      // 🔥 Handle duplicate email specifically
      if (err.response && err.response.data.error) {
        if (err.response.data.error.toLowerCase().includes("email")) {
          showPopup("⚠️ This email is already registered. Try logging in instead.", "error");
        } else {
          showPopup(err.response.data.error, "error");
        }
      } 
      else if (err.response && err.response.data.message) {
        showPopup(err.response.data.message, "error");
      } 
      else if (err.request) {
        showPopup("Network error. Please check your connection.", "error");
      } 
      else {
        showPopup("Registration failed. Please try again.", "error");
      }
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      register();
    }
  };

  // Get password strength color and text
  const getPasswordStrengthInfo = () => {
    if (passwordStrength === 0) return { color: "#666", text: "Very Weak", width: "0%" };
    if (passwordStrength === 1) return { color: "#ff4444", text: "Weak", width: "20%" };
    if (passwordStrength === 2) return { color: "#ff8844", text: "Fair", width: "40%" };
    if (passwordStrength === 3) return { color: "#ffcc44", text: "Good", width: "60%" };
    if (passwordStrength === 4) return { color: "#88ff44", text: "Strong", width: "80%" };
    return { color: "#44ff44", text: "Very Strong", width: "100%" };
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
      maxWidth: "500px",
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
    registerButton: {
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
      <div style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        width: "300px",
        height: "300px",
        background: `radial-gradient(circle, ${theme.primary}0A 0%, transparent 70%)`,
        borderRadius: "50%",
        filter: "blur(50px)",
        pointerEvents: "none",
        transform: "translate(-50%, -50%)",
        animation: "pulse 4s ease-in-out infinite"
      }}></div>

      {/* Animated particles */}
      <div className="particles">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>

      {/* Register Form Container */}
      <div style={styles.formContainer}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{
            fontSize: "3rem",
            marginBottom: "0.5rem",
            animation: "bounce 2s ease-in-out infinite"
          }}>📝</div>
          <h2 style={{
            fontSize: "2rem",
            fontWeight: 700,
            color: theme.text,
            marginBottom: "0.5rem"
          }}>
            Create Account
          </h2>
          <p style={{
            color: `${theme.text}CC`,
            fontSize: "0.9rem"
          }}>
            Join PrajnaAI to start your learning journey
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div style={{
            background: "rgba(40, 167, 69, 0.1)",
            border: "1px solid rgba(40, 167, 69, 0.3)",
            borderRadius: "12px",
            padding: "0.75rem 1rem",
            marginBottom: "1.5rem",
            color: "#51d675",
            fontSize: "0.9rem",
            textAlign: "center",
            animation: "slideIn 0.5s ease-out"
          }}>
            ✅ {success}
          </div>
        )}

        {/* Name Input */}
        <div style={{ marginBottom: "1.25rem" }}>
          <label style={{
            display: "block",
            color: theme.primary,
            marginBottom: "0.5rem",
            fontSize: "0.9rem",
            fontWeight: 500
          }}>
            Full Name
          </label>
          <input
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
            autoComplete="name"
          />
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
        <div style={{ marginBottom: "1.25rem" }}>
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
              placeholder="Create a password (min 6 characters)"
              value={password}
              onChange={handlePasswordChange}
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
              autoComplete="new-password"
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
          
          {/* Password Strength Indicator */}
          {password && (
            <div style={{ marginTop: "0.5rem", animation: "fadeInUp 0.3s ease-out" }}>
              <div style={{
                height: "4px",
                background: "rgba(255, 255, 255, 0.1)",
                borderRadius: "2px",
                overflow: "hidden"
              }}>
                <div style={{
                  width: getPasswordStrengthInfo().width,
                  height: "100%",
                  background: getPasswordStrengthInfo().color,
                  transition: "width 0.3s ease"
                }}></div>
              </div>
              <p style={{
                color: getPasswordStrengthInfo().color,
                fontSize: "0.7rem",
                marginTop: "0.25rem",
                textAlign: "right"
              }}>
                Password Strength: {getPasswordStrengthInfo().text}
              </p>
            </div>
          )}
        </div>

        {/* Confirm Password Input */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{
            display: "block",
            color: theme.primary,
            marginBottom: "0.5rem",
            fontSize: "0.9rem",
            fontWeight: 500
          }}>
            Confirm Password
          </label>
          <div style={{ position: "relative" }}>
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              style={{
                ...styles.input,
                paddingRight: "3rem",
                border: confirmPassword && password !== confirmPassword 
                  ? `1px solid #dc3545` 
                  : `1px solid ${theme.primary}4D`
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = theme.primary;
                e.currentTarget.style.boxShadow = `0 0 0 3px ${theme.primary}1A`;
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = confirmPassword && password !== confirmPassword 
                  ? "#dc3545" 
                  : `${theme.primary}4D`;
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
              }}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
              {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>
          {confirmPassword && password !== confirmPassword && (
            <p style={{
              color: "#ff6b6b",
              fontSize: "0.75rem",
              marginTop: "0.25rem",
              animation: "shake 0.3s ease-out"
            }}>
              ⚠️ Passwords do not match
            </p>
          )}
        </div>

        {/* Register Button */}
        <button
          onClick={register}
          disabled={loading}
          style={{
            ...styles.registerButton,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: loading ? "none" : `0 4px 15px ${theme.primary}4D`,
            position: "relative",
            overflow: "hidden"
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
              Creating Account...
            </span>
          ) : (
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
              📝 Create Account
            </span>
          )}
        </button>

        {/* Login Link */}
        <div style={{
          textAlign: "center",
          marginTop: "1.5rem",
          paddingTop: "1.5rem",
          borderTop: `1px solid ${theme.primary}1A`
        }}>
          <p style={{ color: `${theme.text}CC`, fontSize: "0.9rem" }}>
            Already have an account?{" "}
            <Link
              to="/login"
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
              Login here
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
            }}>Enter</kbd> key to register quickly
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

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
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

        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.6; transform: translate(-50%, -50%) scale(1.1); }
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

        /* Remove autofill background */
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
          left: 5%;
          width: 6px;
          height: 6px;
          animation-duration: 12s;
          animation-delay: 0s;
        }

        .particle:nth-child(2) {
          left: 15%;
          width: 3px;
          height: 3px;
          animation-duration: 10s;
          animation-delay: 2s;
        }

        .particle:nth-child(3) {
          left: 25%;
          width: 5px;
          height: 5px;
          animation-duration: 14s;
          animation-delay: 1s;
        }

        .particle:nth-child(4) {
          left: 40%;
          width: 4px;
          height: 4px;
          animation-duration: 9s;
          animation-delay: 3s;
        }

        .particle:nth-child(5) {
          left: 55%;
          width: 7px;
          height: 7px;
          animation-duration: 11s;
          animation-delay: 0.5s;
        }

        .particle:nth-child(6) {
          left: 70%;
          width: 3px;
          height: 3px;
          animation-duration: 13s;
          animation-delay: 1.5s;
        }

        .particle:nth-child(7) {
          left: 85%;
          width: 5px;
          height: 5px;
          animation-duration: 15s;
          animation-delay: 2.5s;
        }

        .particle:nth-child(8) {
          left: 95%;
          width: 4px;
          height: 4px;
          animation-duration: 11s;
          animation-delay: 3.5s;
        }

        /* Form input focus ring animation */
        input:focus {
          animation: glowPulse 1.5s ease-in-out infinite;
        }

        @keyframes glowPulse {
          0%, 100% {
            box-shadow: 0 0 0 0 ${theme.primary}1A;
          }
          50% {
            box-shadow: 0 0 0 4px ${theme.primary}1A;
          }
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

export default Register;