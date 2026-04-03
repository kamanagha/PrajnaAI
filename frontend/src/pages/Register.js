import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

function Register() {
  const navigate = useNavigate();

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

  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token") || localStorage.getItem("authToken");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

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
      setError("All fields are required");
      return;
    }

    if (name.length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
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
          setError("⚠️ This email is already registered. Try logging in instead.");
        } else {
          setError(err.response.data.error);
        }
      } 
      else if (err.response && err.response.data.message) {
        setError(err.response.data.message);
      } 
      else if (err.request) {
        setError("Network error. Please check your connection.");
      } 
      else {
        setError("Registration failed. Please try again.");
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

  return (
    <div style={{
      minHeight: "calc(100vh - 80px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0d0d0d 100%)",
      padding: "2rem 1.5rem",
      fontFamily: "'Poppins', 'Segoe UI', 'Montserrat', system-ui, sans-serif"
    }}>
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
      <div style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        width: "300px",
        height: "300px",
        background: "radial-gradient(circle, rgba(255, 107, 0, 0.05) 0%, transparent 70%)",
        borderRadius: "50%",
        filter: "blur(50px)",
        pointerEvents: "none",
        transform: "translate(-50%, -50%)"
      }}></div>

      {/* Register Form Container */}
      <div style={{
        maxWidth: "500px",
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
          }}>📝</div>
          <h2 style={{
            fontSize: "2rem",
            fontWeight: 700,
            background: "linear-gradient(135deg, #FF6B00, #FF8C00, #FFA500)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
            marginBottom: "0.5rem"
          }}>
            Create Account
          </h2>
          <p style={{
            color: "#a0a0a0",
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

        {/* Error Message */}
        {error && (
          <div style={{
            background: "rgba(220, 53, 69, 0.1)",
            border: "1px solid rgba(220, 53, 69, 0.3)",
            borderRadius: "12px",
            padding: "0.75rem 1rem",
            marginBottom: "1.5rem",
            color: "#ff6b6b",
            fontSize: "0.9rem",
            textAlign: "center",
            animation: "shake 0.5s ease-out"
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Name Input */}
        <div style={{ marginBottom: "1.25rem" }}>
          <label style={{
            display: "block",
            color: "#FFA500",
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
            autoComplete="name"
          />
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
        <div style={{ marginBottom: "1.25rem" }}>
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
              placeholder="Create a password (min 6 characters)"
              value={password}
              onChange={handlePasswordChange}
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
          
          {/* Password Strength Indicator */}
          {password && (
            <div style={{ marginTop: "0.5rem" }}>
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
            color: "#FFA500",
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
                width: "100%",
                padding: "0.9rem 1rem",
                background: "rgba(255, 255, 255, 0.05)",
                border: `1px solid ${
                  confirmPassword && password !== confirmPassword 
                    ? "rgba(220, 53, 69, 0.5)" 
                    : "rgba(255, 140, 0, 0.3)"
                }`,
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
                e.currentTarget.style.borderColor = confirmPassword && password !== confirmPassword 
                  ? "rgba(220, 53, 69, 0.5)" 
                  : "rgba(255, 140, 0, 0.3)";
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
                color: "#FFA500",
                cursor: "pointer",
                fontSize: "1.1rem",
                padding: "0.5rem",
                transition: "color 0.3s ease"
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = "#FF8C00"}
              onMouseLeave={(e) => e.currentTarget.style.color = "#FFA500"}
            >
              {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>
          {confirmPassword && password !== confirmPassword && (
            <p style={{
              color: "#ff6b6b",
              fontSize: "0.75rem",
              marginTop: "0.25rem"
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
            opacity: loading ? 0.7 : 1,
            position: "relative",
            overflow: "hidden"
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
          borderTop: "1px solid rgba(255, 140, 0, 0.1)"
        }}>
          <p style={{ color: "#a0a0a0", fontSize: "0.9rem" }}>
            Already have an account?{" "}
            <Link
              to="/login"
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
              Login here
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
            }}>Enter</kbd> key to register quickly
          </p>
        </div>
      </div>

      {/* Add CSS animations */}
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
          color: #FFA500;
          background-color: rgba(255, 140, 0, 0.2);
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}

export default Register;