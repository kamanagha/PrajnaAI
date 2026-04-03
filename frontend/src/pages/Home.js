import { Link, useNavigate } from "react-router-dom";
import { isLoggedIn } from "../utils/authUtils"; // Adjust path as needed

function Home() {
  const navigate = useNavigate();

  // Handle Get Started click
  const handleGetStarted = () => {
    if (isLoggedIn()) {
      // Redirect to dashboard if logged in
      navigate('/dashboard');
    } else {
      // Redirect to login if not logged in
      navigate('/login');
    }
  };

  return (
    <div style={{
      fontFamily: "'Poppins', 'Segoe UI', 'Montserrat', system-ui, -apple-system, sans-serif",
      background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0d0d0d 100%)",
      minHeight: "100vh",
      margin: 0,
      padding: 0,
      position: "relative",
      overflowX: "hidden",
      overflowY: "auto"
    }}>
      <div style={{
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "3rem 1.5rem",
        margin: 0,
        overflow: "hidden"
      }}>
        {/* Decorative animated background elements - Orange/Black theme */}
        <div style={{
          position: "absolute",
          top: "-20%",
          left: "-10%",
          width: "600px",
          height: "600px",
          background: "radial-gradient(circle, rgba(255, 94, 0, 0.15) 0%, rgba(255, 94, 0, 0.05) 60%, transparent 100%)",
          borderRadius: "50%",
          filter: "blur(80px)",
          zIndex: 0,
          pointerEvents: "none",
          animation: "pulse 8s ease-in-out infinite"
        }}></div>
        <div style={{
          position: "absolute",
          bottom: "-15%",
          right: "-5%",
          width: "700px",
          height: "700px",
          background: "radial-gradient(circle, rgba(255, 94, 0, 0.12) 0%, rgba(255, 94, 0, 0.03) 70%, transparent 100%)",
          borderRadius: "50%",
          filter: "blur(100px)",
          zIndex: 0,
          pointerEvents: "none",
          animation: "pulse 10s ease-in-out infinite reverse"
        }}></div>
        <div style={{
          position: "absolute",
          top: "40%",
          left: "30%",
          width: "400px",
          height: "400px",
          background: "radial-gradient(circle, rgba(255, 140, 0, 0.08) 0%, transparent 70%)",
          borderRadius: "50%",
          filter: "blur(60px)",
          zIndex: 0,
          pointerEvents: "none"
        }}></div>

        {/* Keyframes animation for pulsing effect */}
        <style>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.6; }
            50% { transform: scale(1.1); opacity: 1; }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          @keyframes glow {
            0%, 100% { box-shadow: 0 0 5px rgba(255, 94, 0, 0.3); }
            50% { box-shadow: 0 0 20px rgba(255, 94, 0, 0.6); }
          }
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            margin: 0;
            padding: 0;
            overflow-x: hidden;
          }
        `}</style>

        {/* Overlay */}
        <div style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: "1280px",
          margin: "0 auto"
        }}>
          {/* Container text-center */}
          <div style={{
            textAlign: "center",
            width: "100%"
          }}>
            {/* Main Heading */}
            <h1 style={{
              fontSize: "calc(2.8rem + 1.8vw)",
              fontWeight: 800,
              color: "#ffffff",
              marginBottom: "1.2rem",
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
              textShadow: "0 4px 20px rgba(0,0,0,0.3)",
              animation: "float 6s ease-in-out infinite"
            }}>
              📚 Welcome to{" "}
              <span style={{
                background: "linear-gradient(135deg, #FF6B00, #FF8C00, #FFA500)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
                fontWeight: 800,
                position: "relative",
                display: "inline-block",
                textShadow: "none"
              }}>
                PrajnaAI
              </span>
            </h1>

            {/* Description */}
            <p style={{
              fontSize: "1.3rem",
              lineHeight: 1.6,
              color: "#e0e0e0",
              marginBottom: "2rem",
              maxWidth: "750px",
              marginLeft: "auto",
              marginRight: "auto",
              fontWeight: 500,
              backdropFilter: "blur(2px)"
            }}>
              Your smart platform to{" "}
              <strong style={{ fontWeight: 700, color: "#FF8C00" }}>
                import, export and manage
              </strong>{" "}
              study materials effortlessly.
            </p>

            {/* Button Group */}
            <div style={{
              marginBottom: "3.5rem",
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: "1.2rem"
            }}>
              {/* Get Started Button with Auth Logic */}
              <button
                onClick={handleGetStarted}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  background: "linear-gradient(135deg, #FF6B00, #FF8C00)",
                  color: "white",
                  textDecoration: "none",
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  padding: "0.9rem 2.2rem",
                  borderRadius: "50px",
                  transition: "all 0.3s ease",
                  boxShadow: "0 8px 25px rgba(255, 107, 0, 0.4)",
                  border: "1px solid rgba(255, 140, 0, 0.5)",
                  cursor: "pointer",
                  letterSpacing: "0.5px",
                  fontFamily: "inherit"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 15px 35px rgba(255, 107, 0, 0.6)";
                  e.currentTarget.style.background = "linear-gradient(135deg, #FF7B00, #FF9D00)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 8px 25px rgba(255, 107, 0, 0.4)";
                  e.currentTarget.style.background = "linear-gradient(135deg, #FF6B00, #FF8C00)";
                }}
              >
                🚀 Get Started
              </button>

              <Link
                to="/materials"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  background: "rgba(0, 0, 0, 0.7)",
                  backdropFilter: "blur(10px)",
                  color: "#FFA500",
                  textDecoration: "none",
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  padding: "0.9rem 2.2rem",
                  borderRadius: "50px",
                  border: "2px solid #FF8C00",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                  letterSpacing: "0.5px"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 140, 0, 0.15)";
                  e.currentTarget.style.borderColor = "#FFA500";
                  e.currentTarget.style.color = "#FFB347";
                  e.currentTarget.style.transform = "translateY(-4px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(0, 0, 0, 0.7)";
                  e.currentTarget.style.borderColor = "#FF8C00";
                  e.currentTarget.style.color = "#FFA500";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                📂 View Materials
              </Link>
            </div>

            {/* Features Row */}
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "2rem",
              marginTop: "2rem"
            }}>
              {/* Feature Card 1 */}
              <div style={{
                flex: "1 1 280px",
                maxWidth: "320px",
                background: "linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(20, 20, 20, 0.9))",
                backdropFilter: "blur(10px)",
                borderRadius: "20px",
                padding: "2rem 1.5rem",
                textAlign: "center",
                transition: "all 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1)",
                border: "1px solid rgba(255, 140, 0, 0.2)",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
                cursor: "default"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-10px)";
                e.currentTarget.style.borderColor = "rgba(255, 140, 0, 0.6)";
                e.currentTarget.style.boxShadow = "0 20px 40px rgba(255, 107, 0, 0.2)";
                e.currentTarget.style.background = "linear-gradient(135deg, rgba(20, 20, 20, 0.95), rgba(30, 30, 30, 0.95))";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "rgba(255, 140, 0, 0.2)";
                e.currentTarget.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.5)";
                e.currentTarget.style.background = "linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(20, 20, 20, 0.9))";
              }}>
                <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>📤</div>
                <h4 style={{
                  fontSize: "1.7rem",
                  fontWeight: 700,
                  color: "#FFA500",
                  marginBottom: "0.75rem",
                  letterSpacing: "-0.3px"
                }}>
                  Import Materials
                </h4>
                <p style={{ color: "#cccccc", fontSize: "1rem", lineHeight: 1.6, marginBottom: 0 }}>
                  Upload notes, PDFs, and study resources in one place.
                </p>
              </div>

              {/* Feature Card 2 */}
              <div style={{
                flex: "1 1 280px",
                maxWidth: "320px",
                background: "linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(20, 20, 20, 0.9))",
                backdropFilter: "blur(10px)",
                borderRadius: "20px",
                padding: "2rem 1.5rem",
                textAlign: "center",
                transition: "all 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1)",
                border: "1px solid rgba(255, 140, 0, 0.2)",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
                cursor: "default"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-10px)";
                e.currentTarget.style.borderColor = "rgba(255, 140, 0, 0.6)";
                e.currentTarget.style.boxShadow = "0 20px 40px rgba(255, 107, 0, 0.2)";
                e.currentTarget.style.background = "linear-gradient(135deg, rgba(20, 20, 20, 0.95), rgba(30, 30, 30, 0.95))";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "rgba(255, 140, 0, 0.2)";
                e.currentTarget.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.5)";
                e.currentTarget.style.background = "linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(20, 20, 20, 0.9))";
              }}>
                <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>📥</div>
                <h4 style={{
                  fontSize: "1.7rem",
                  fontWeight: 700,
                  color: "#FFA500",
                  marginBottom: "0.75rem",
                  letterSpacing: "-0.3px"
                }}>
                  Export Materials
                </h4>
                <p style={{ color: "#cccccc", fontSize: "1rem", lineHeight: 1.6 }}>
                  Download and share study content anytime, anywhere.
                </p>
              </div>

              {/* Feature Card 3 */}
              <div style={{
                flex: "1 1 280px",
                maxWidth: "320px",
                background: "linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(20, 20, 20, 0.9))",
                backdropFilter: "blur(10px)",
                borderRadius: "20px",
                padding: "2rem 1.5rem",
                textAlign: "center",
                transition: "all 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1)",
                border: "1px solid rgba(255, 140, 0, 0.2)",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
                cursor: "default"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-10px)";
                e.currentTarget.style.borderColor = "rgba(255, 140, 0, 0.6)";
                e.currentTarget.style.boxShadow = "0 20px 40px rgba(255, 107, 0, 0.2)";
                e.currentTarget.style.background = "linear-gradient(135deg, rgba(20, 20, 20, 0.95), rgba(30, 30, 30, 0.95))";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "rgba(255, 140, 0, 0.2)";
                e.currentTarget.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.5)";
                e.currentTarget.style.background = "linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(20, 20, 20, 0.9))";
              }}>
                <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>🧠</div>
                <h4 style={{
                  fontSize: "1.7rem",
                  fontWeight: 700,
                  color: "#FFA500",
                  marginBottom: "0.75rem",
                  letterSpacing: "-0.3px"
                }}>
                  Smart Learning
                </h4>
                <p style={{ color: "#cccccc", fontSize: "1rem", lineHeight: 1.6 }}>
                  Organize your learning resources efficiently.
                </p>
              </div>
            </div>

            {/* Trust Badges - Orange/Black theme */}
            <div style={{
              marginTop: "4rem",
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: "2rem",
              alignItems: "center"
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                background: "rgba(0, 0, 0, 0.6)",
                backdropFilter: "blur(10px)",
                padding: "0.5rem 1.5rem",
                borderRadius: "50px",
                border: "1px solid rgba(255, 140, 0, 0.3)"
              }}>
                <span style={{ fontSize: "1.1rem" }}>🎓</span>
                <span style={{ color: "#FFA500", fontSize: "0.9rem", fontWeight: 600 }}>
                  AI-powered learning
                </span>
              </div>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                background: "rgba(0, 0, 0, 0.6)",
                backdropFilter: "blur(10px)",
                padding: "0.5rem 1.5rem",
                borderRadius: "50px",
                border: "1px solid rgba(255, 140, 0, 0.3)"
              }}>
                <span style={{ fontSize: "1.1rem" }}>☁️</span>
                <span style={{ color: "#FFA500", fontSize: "0.9rem", fontWeight: 600 }}>
                  Seamless sync
                </span>
              </div>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                background: "rgba(0, 0, 0, 0.6)",
                backdropFilter: "blur(10px)",
                padding: "0.5rem 1.5rem",
                borderRadius: "50px",
                border: "1px solid rgba(255, 140, 0, 0.3)"
              }}>
                <span style={{ fontSize: "1.1rem" }}>⚡</span>
                <span style={{ color: "#FFA500", fontSize: "0.9rem", fontWeight: 600 }}>
                  Fast & efficient
                </span>
              </div>
            </div>

            {/* Footer */}
            <div style={{
              marginTop: "4rem",
              fontSize: "0.85rem",
              color: "#888888",
              borderTop: "1px solid rgba(255, 140, 0, 0.2)",
              paddingTop: "2rem",
              maxWidth: "500px",
              marginLeft: "auto",
              marginRight: "auto"
            }}>
              <span style={{
                background: "linear-gradient(135deg, #FF8C00, #FFA500)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
                fontWeight: 600
              }}>
                PrajnaAI — Empowering education with intelligence
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;