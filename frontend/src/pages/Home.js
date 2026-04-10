import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { isLoggedIn } from "../utils/authUtils";
import { useTheme } from "../context/ThemeContext";

function Home() {
  const navigate = useNavigate();
  const { currentTheme, themes } = useTheme();
  const theme = themes[currentTheme];
  const [isAnimating, setIsAnimating] = useState(true);
  const [showContent, setShowContent] = useState(false);

  // Handle Get Started click
  const handleGetStarted = () => {
    if (isLoggedIn()) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  useEffect(() => {
    // Cinematic intro animation
    const timer = setTimeout(() => {
      setIsAnimating(false);
      setTimeout(() => setShowContent(true), 100);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Dynamic styles based on theme - updated in real-time
  const getStyles = () => ({
    container: {
      fontFamily: "'Poppins', 'Segoe UI', 'Montserrat', system-ui, -apple-system, sans-serif",
      background: `linear-gradient(135deg, ${theme.background} 0%, ${theme.surface} 50%, ${theme.background} 100%)`,
      minHeight: "100vh",
      margin: 0,
      padding: 0,
      position: "relative",
      overflowX: "hidden",
      overflowY: "auto",
      transition: "background 0.5s ease-in-out"
    },
    gradientText: {
      background: theme.gradient,
      backgroundClip: "text",
      WebkitBackgroundClip: "text",
      color: "transparent",
      fontWeight: 900,
      position: "relative",
      display: "inline-block",
    },
    primaryButton: {
      display: "inline-flex",
      alignItems: "center",
      gap: "0.6rem",
      background: theme.gradient,
      color: "white",
      textDecoration: "none",
      fontWeight: 700,
      fontSize: "1.1rem",
      padding: "0.9rem 2.2rem",
      borderRadius: "50px",
      transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      boxShadow: `0 8px 25px ${theme.primary}66`,
      border: `1px solid ${theme.secondary}80`,
      cursor: "pointer",
      letterSpacing: "0.5px",
      fontFamily: "inherit",
      position: "relative",
      overflow: "hidden"
    },
    secondaryButton: {
      display: "inline-flex",
      alignItems: "center",
      gap: "0.6rem",
      background: "rgba(0, 0, 0, 0.7)",
      backdropFilter: "blur(10px)",
      color: theme.primary,
      textDecoration: "none",
      fontWeight: 700,
      fontSize: "1.1rem",
      padding: "0.9rem 2.2rem",
      borderRadius: "50px",
      border: `2px solid ${theme.primary}`,
      transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      cursor: "pointer",
      letterSpacing: "0.5px"
    },
    featureCard: {
      flex: "1 1 280px",
      maxWidth: "320px",
      background: "linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(20, 20, 20, 0.9))",
      backdropFilter: "blur(10px)",
      borderRadius: "20px",
      padding: "2rem 1.5rem",
      textAlign: "center",
      transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      border: `1px solid ${theme.primary}33`,
      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
      cursor: "default",
      opacity: showContent ? 1 : 0,
      transform: showContent ? "translateY(0)" : "translateY(30px)",
      transitionDelay: "0.6s"
    },
    trustBadge: {
      display: "flex",
      alignItems: "center",
      gap: "0.6rem",
      background: "rgba(0, 0, 0, 0.6)",
      backdropFilter: "blur(10px)",
      padding: "0.5rem 1.5rem",
      borderRadius: "50px",
      border: `1px solid ${theme.primary}4D`,
      transition: "all 0.3s ease"
    }
  });

  const styles = getStyles();

  // Cinematic Intro Component
  if (isAnimating) {
    return (
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `linear-gradient(135deg, ${theme.background}, ${theme.surface})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
        overflow: "hidden"
      }}>
        {/* Cinematic overlay effects */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "100px",
          background: "linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)",
          zIndex: 2
        }}></div>
        <div style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "100px",
          background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
          zIndex: 2
        }}></div>
        
        {/* Animated particles */}
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: "2px",
              height: "2px",
              background: theme.primary,
              borderRadius: "50%",
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `particleFloat ${3 + Math.random() * 4}s linear infinite`,
              opacity: 0,
              animationDelay: `${Math.random() * 3}s`
            }}
          />
        ))}
        
        {/* Cinematic light sweep */}
        <div style={{
          position: "absolute",
          top: 0,
          left: "-100%",
          width: "100%",
          height: "100%",
          background: `linear-gradient(90deg, transparent, ${theme.primary}20, transparent)`,
          animation: "lightSweep 2s ease-in-out infinite",
          zIndex: 1
        }}></div>
        
        {/* Main intro content */}
        <div style={{
          textAlign: "center",
          zIndex: 3,
          animation: "cinematicZoom 2.5s ease-out forwards"
        }}>
          {/* Logo animation */}
          <div style={{
            marginBottom: "2rem",
            animation: "logoSpin 1.5s ease-out"
          }}>
            <div style={{
              fontSize: "6rem",
              display: "inline-block",
              animation: "iconBounce 1s ease-out"
            }}>
              🚀
            </div>
          </div>
          
          {/* Title reveal */}
          <h1 style={{
            fontSize: "4rem",
            fontWeight: 900,
            background: theme.gradient,
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
            marginBottom: "1rem",
            animation: "titleReveal 1.5s ease-out",
            letterSpacing: "-0.02em"
          }}>
            PrajnaAI
          </h1>
          
          {/* Tagline */}
          <p style={{
            fontSize: "1.2rem",
            color: theme.text,
            opacity: 0,
            animation: "fadeInUp 1s ease-out 0.5s forwards",
            letterSpacing: "2px"
          }}>
            Empowering Education with Intelligence
          </p>
          
          {/* Loading bar */}
          <div style={{
            width: "200px",
            height: "2px",
            background: `${theme.primary}33`,
            marginTop: "2rem",
            position: "relative",
            overflow: "hidden",
            borderRadius: "2px"
          }}>
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              height: "100%",
              width: "100%",
              background: theme.gradient,
              animation: "loadingProgress 2s ease-out forwards"
            }}></div>
          </div>
        </div>
        
        <style>{`
          @keyframes cinematicZoom {
            0% {
              transform: scale(1.5);
              opacity: 0;
            }
            30% {
              transform: scale(1);
              opacity: 1;
            }
            70% {
              transform: scale(1);
              opacity: 1;
            }
            100% {
              transform: scale(1);
              opacity: 0;
            }
          }
          
          @keyframes logoSpin {
            0% {
              transform: rotate(0deg) scale(0);
              opacity: 0;
            }
            50% {
              transform: rotate(180deg) scale(1.2);
            }
            100% {
              transform: rotate(360deg) scale(1);
              opacity: 1;
            }
          }
          
          @keyframes iconBounce {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-20px);
            }
          }
          
          @keyframes titleReveal {
            0% {
              opacity: 0;
              transform: translateY(30px);
              filter: blur(10px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
              filter: blur(0);
            }
          }
          
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 0.8;
              transform: translateY(0);
            }
          }
          
          @keyframes loadingProgress {
            0% {
              width: 0%;
            }
            100% {
              width: 100%;
            }
          }
          
          @keyframes lightSweep {
            0% {
              left: -100%;
            }
            100% {
              left: 100%;
            }
          }
          
          @keyframes particleFloat {
            0% {
              opacity: 0;
              transform: translateY(0) translateX(0);
            }
            10% {
              opacity: 0.5;
            }
            90% {
              opacity: 0.5;
            }
            100% {
              opacity: 0;
              transform: translateY(-100px) translateX(20px);
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={styles.container}>
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
        {/* Decorative animated background elements - Theme based */}
        <div style={{
          position: "absolute",
          top: "-20%",
          left: "-10%",
          width: "600px",
          height: "600px",
          background: `radial-gradient(circle, ${theme.primary}26 0%, ${theme.primary}0D 60%, transparent 100%)`,
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
          background: `radial-gradient(circle, ${theme.secondary}1F 0%, ${theme.primary}08 70%, transparent 100%)`,
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
          background: `radial-gradient(circle, ${theme.primary}14 0%, transparent 70%)`,
          borderRadius: "50%",
          filter: "blur(60px)",
          zIndex: 0,
          pointerEvents: "none"
        }}></div>

        {/* Animated floating orbs */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: `${50 + Math.random() * 100}px`,
              height: `${50 + Math.random() * 100}px`,
              background: `radial-gradient(circle, ${theme.primary}10, transparent)`,
              borderRadius: "50%",
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `floatOrb ${15 + Math.random() * 10}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
              zIndex: 0,
              pointerEvents: "none"
            }}
          />
        ))}

        <style>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.6; }
            50% { transform: scale(1.1); opacity: 1; }
          }
          
          @keyframes floatOrb {
            0%, 100% {
              transform: translate(0, 0) rotate(0deg);
            }
            33% {
              transform: translate(30px, -30px) rotate(120deg);
            }
            66% {
              transform: translate(-20px, 20px) rotate(240deg);
            }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          
          @keyframes titleGlow {
            0%, 100% { 
              text-shadow: 0 0 20px ${theme.primary}80,
                           0 0 40px ${theme.primary}40,
                           0 0 60px ${theme.primary}20;
            }
            50% { 
              text-shadow: 0 0 30px ${theme.primary}CC,
                           0 0 60px ${theme.primary}80,
                           0 0 90px ${theme.primary}40;
            }
          }
          
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          
          @keyframes slideInLeft {
            from {
              opacity: 0;
              transform: translateX(-50px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          
          @keyframes slideInRight {
            from {
              opacity: 0;
              transform: translateX(50px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          
          @keyframes fadeInScale {
            from {
              opacity: 0;
              transform: scale(0.8);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          
          .feature-card {
            animation: fadeInScale 0.6s ease-out forwards;
          }
          
          .feature-card:nth-child(1) { animation-delay: 0.2s; }
          .feature-card:nth-child(2) { animation-delay: 0.4s; }
          .feature-card:nth-child(3) { animation-delay: 0.6s; }
          
          button, a {
            position: relative;
            overflow: hidden;
          }
          
          button::before, a::before {
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
          
          button:hover::before, a:hover::before {
            width: 300px;
            height: 300px;
          }
        `}</style>

        {/* Overlay */}
        <div style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: "1280px",
          margin: "0 auto",
          opacity: showContent ? 1 : 0,
          animation: showContent ? "fadeInScale 0.8s ease-out" : "none"
        }}>
          <div style={{ textAlign: "center", width: "100%" }}>
            {/* Main Heading with cinematic reveal */}
            <div style={{
              position: "relative",
              display: "inline-block",
              marginBottom: "1.2rem",
              animation: "slideInLeft 0.8s ease-out"
            }}>
              <h1 style={{
                fontSize: "calc(3.5rem + 2vw)",
                fontWeight: 900,
                color: "#ffffff",
                marginBottom: "1.2rem",
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
                textShadow: `0 4px 20px rgba(0,0,0,0.5),
                             0 0 40px ${theme.primary}40,
                             0 0 80px ${theme.primary}20`,
                animation: "float 6s ease-in-out infinite, titleGlow 3s ease-in-out infinite",
                position: "relative",
                zIndex: 1
              }}>
                📚 Welcome to{" "}
                <span style={{
                  background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary}, ${theme.accent}, ${theme.primary})`,
                  backgroundSize: "300% 300%",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                  fontWeight: 900,
                  position: "relative",
                  display: "inline-block",
                  textShadow: "none",
                  animation: "gradientShift 5s ease infinite"
                }}>
                  PrajnaAI
                </span>
              </h1>
            </div>

            {/* Description */}
            <p style={{
              fontSize: "1.3rem",
              lineHeight: 1.6,
              color: theme.text,
              marginBottom: "2rem",
              maxWidth: "750px",
              marginLeft: "auto",
              marginRight: "auto",
              fontWeight: 500,
              backdropFilter: "blur(2px)",
              opacity: 0.95,
              textShadow: "0 1px 2px rgba(0,0,0,0.2)",
              animation: "slideInRight 0.8s ease-out"
            }}>
              Your smart platform to{" "}
              <strong style={{ 
                fontWeight: 700, 
                color: theme.primary,
                textShadow: `0 0 10px ${theme.primary}40`
              }}>
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
              gap: "1.2rem",
              animation: "fadeInScale 0.6s ease-out 0.3s both"
            }}>
              <button
                onClick={handleGetStarted}
                style={styles.primaryButton}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px) scale(1.05)";
                  e.currentTarget.style.boxShadow = `0 15px 35px ${theme.primary}99`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0) scale(1)";
                  e.currentTarget.style.boxShadow = `0 8px 25px ${theme.primary}66`;
                }}
              >
                🚀 Get Started
              </button>

              <Link
                to="/materials"
                style={styles.secondaryButton}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `${theme.primary}26`;
                  e.currentTarget.style.borderColor = theme.secondary;
                  e.currentTarget.style.color = theme.secondary;
                  e.currentTarget.style.transform = "translateY(-4px) scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(0, 0, 0, 0.7)";
                  e.currentTarget.style.borderColor = theme.primary;
                  e.currentTarget.style.color = theme.primary;
                  e.currentTarget.style.transform = "translateY(0) scale(1)";
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
              <div
                className="feature-card"
                style={styles.featureCard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-10px) scale(1.02)";
                  e.currentTarget.style.borderColor = `${theme.primary}99`;
                  e.currentTarget.style.boxShadow = `0 20px 40px ${theme.primary}33`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0) scale(1)";
                  e.currentTarget.style.borderColor = `${theme.primary}33`;
                  e.currentTarget.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.5)";
                }}
              >
                <div style={{ fontSize: "3.5rem", marginBottom: "1rem", animation: "float 3s ease-in-out infinite" }}>📤</div>
                <h4 style={{
                  fontSize: "1.7rem",
                  fontWeight: 700,
                  color: theme.primary,
                  marginBottom: "0.75rem",
                  letterSpacing: "-0.3px"
                }}>
                  Import Materials
                </h4>
                <p style={{ color: theme.text, opacity: 0.8, fontSize: "1rem", lineHeight: 1.6, marginBottom: 0 }}>
                  Upload notes, PDFs, and study resources in one place.
                </p>
              </div>

              {/* Feature Card 2 */}
              <div
                className="feature-card"
                style={styles.featureCard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-10px) scale(1.02)";
                  e.currentTarget.style.borderColor = `${theme.primary}99`;
                  e.currentTarget.style.boxShadow = `0 20px 40px ${theme.primary}33`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0) scale(1)";
                  e.currentTarget.style.borderColor = `${theme.primary}33`;
                  e.currentTarget.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.5)";
                }}
              >
                <div style={{ fontSize: "3.5rem", marginBottom: "1rem", animation: "float 3s ease-in-out infinite 0.5s" }}>📥</div>
                <h4 style={{
                  fontSize: "1.7rem",
                  fontWeight: 700,
                  color: theme.primary,
                  marginBottom: "0.75rem",
                  letterSpacing: "-0.3px"
                }}>
                  Export Materials
                </h4>
                <p style={{ color: theme.text, opacity: 0.8, fontSize: "1rem", lineHeight: 1.6 }}>
                  Download and share study content anytime, anywhere.
                </p>
              </div>

              {/* Feature Card 3 */}
              <div
                className="feature-card"
                style={styles.featureCard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-10px) scale(1.02)";
                  e.currentTarget.style.borderColor = `${theme.primary}99`;
                  e.currentTarget.style.boxShadow = `0 20px 40px ${theme.primary}33`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0) scale(1)";
                  e.currentTarget.style.borderColor = `${theme.primary}33`;
                  e.currentTarget.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.5)";
                }}
              >
                <div style={{ fontSize: "3.5rem", marginBottom: "1rem", animation: "float 3s ease-in-out infinite 1s" }}>🧠</div>
                <h4 style={{
                  fontSize: "1.7rem",
                  fontWeight: 700,
                  color: theme.primary,
                  marginBottom: "0.75rem",
                  letterSpacing: "-0.3px"
                }}>
                  Smart Learning
                </h4>
                <p style={{ color: theme.text, opacity: 0.8, fontSize: "1rem", lineHeight: 1.6 }}>
                  Organize your learning resources efficiently.
                </p>
              </div>
            </div>

            {/* Trust Badges */}
            <div style={{
              marginTop: "4rem",
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: "2rem",
              alignItems: "center",
              animation: "fadeInScale 0.6s ease-out 0.8s both"
            }}>
              <div style={styles.trustBadge}>
                <span style={{ fontSize: "1.1rem" }}>🎓</span>
                <span style={{ color: theme.primary, fontSize: "0.9rem", fontWeight: 600 }}>
                  AI-powered learning
                </span>
              </div>
              <div style={styles.trustBadge}>
                <span style={{ fontSize: "1.1rem" }}>☁️</span>
                <span style={{ color: theme.primary, fontSize: "0.9rem", fontWeight: 600 }}>
                  Seamless sync
                </span>
              </div>
              <div style={styles.trustBadge}>
                <span style={{ fontSize: "1.1rem" }}>⚡</span>
                <span style={{ color: theme.primary, fontSize: "0.9rem", fontWeight: 600 }}>
                  Fast & efficient
                </span>
              </div>
            </div>

            {/* Footer */}
            <div style={{
              marginTop: "4rem",
              fontSize: "0.85rem",
              color: theme.text,
              opacity: 0.6,
              borderTop: `1px solid ${theme.primary}33`,
              paddingTop: "2rem",
              maxWidth: "500px",
              marginLeft: "auto",
              marginRight: "auto",
              animation: "fadeInScale 0.6s ease-out 1s both"
            }}>
              <span style={{
                background: theme.gradient,
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