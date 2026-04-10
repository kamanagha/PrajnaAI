import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import useAuth from "../hooks/useAuth";
import { useTheme } from "../context/ThemeContext";

function Navbar() {
  const navigate = useNavigate();
  const { user, loading, isAuthenticated, logout } = useAuth();
  const { currentTheme, themes, changeTheme } = useTheme();
  const [showThemeMenu, setShowThemeMenu] = useState(false);

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
        borderBottom: "1px solid var(--border-color)",
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
            background: "var(--gradient)",
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
    <>
      <nav style={{
        background: "rgba(0, 0, 0, 0.95)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid var(--border-color)",
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
              background: "var(--gradient)",
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

          {/* Right Section */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            flexWrap: "wrap"
          }}>
            {/* Theme Switcher Button */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowThemeMenu(!showThemeMenu)}
                style={{
                  background: "rgba(0, 0, 0, 0.8)",
                  color: "var(--primary-color)",
                  padding: "0.6rem 1.2rem",
                  borderRadius: "50px",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  transition: "all 0.3s ease",
                  border: "1.5px solid var(--primary-color)",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  backgroundColor: "transparent"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 107, 0, 0.1)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(0, 0, 0, 0.8)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <span>🎨</span>
                <span>{themes[currentTheme]?.name || 'Theme'}</span>
                <span>▼</span>
              </button>

              {/* Theme Dropdown Menu */}
              {showThemeMenu && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '0.5rem',
                  background: 'var(--surface-color)',
                  border: `1px solid var(--border-color)`,
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
                  minWidth: '220px',
                  zIndex: 1001,
                  overflow: 'hidden',
                  animation: 'slideDown 0.3s ease-out'
                }}>
                  <div style={{
                    padding: '0.75rem 1rem',
                    borderBottom: `1px solid var(--border-color)`,
                    background: 'rgba(0, 0, 0, 0.5)'
                  }}>
                    <span style={{ 
                      color: 'var(--text-primary)',
                      fontWeight: 600,
                      fontSize: '0.9rem'
                    }}>
                      Choose Theme
                    </span>
                  </div>
                  {Object.entries(themes).map(([key, theme]) => (
                    <button
                      key={key}
                      onClick={() => {
                        changeTheme(key);
                        setShowThemeMenu(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        background: currentTheme === key ? 'rgba(255, 107, 0, 0.2)' : 'transparent',
                        border: 'none',
                        color: 'var(--text-color)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        transition: 'all 0.2s ease',
                        textAlign: 'left',
                        fontSize: '0.9rem'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 107, 0, 0.1)';
                        e.currentTarget.style.paddingLeft = '1.25rem';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = currentTheme === key ? 'rgba(255, 107, 0, 0.2)' : 'transparent';
                        e.currentTarget.style.paddingLeft = '1rem';
                      }}
                    >
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '4px',
                        background: theme.gradient,
                        border: '1px solid rgba(255,255,255,0.2)'
                      }}></div>
                      <span>{theme.name}</span>
                      {currentTheme === key && <span style={{ marginLeft: 'auto' }}>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {isAuthenticated && user ? (
              <>
                {/* Welcome Message */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  background: "rgba(255, 140, 0, 0.1)",
                  padding: "0.5rem 1.2rem",
                  borderRadius: "50px",
                  border: "1px solid var(--border-color)",
                  animation: "slideIn 0.5s ease-out"
                }}>
                  <span style={{ fontSize: "1.2rem" }}>👋</span>
                  <span style={{
                    color: "var(--text-color)",
                    fontSize: "0.95rem",
                    fontWeight: 500
                  }}>
                    Welcome, <span style={{
                      fontWeight: 700,
                      color: "var(--primary-color)"
                    }}>{user}</span>
                  </span>
                </div>

                {/* Dashboard Button */}
                <Link
                  to="/dashboard"
                  style={{
                    background: "var(--gradient)",
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
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.5)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.3)";
                  }}
                >
                  📊 Dashboard
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  style={{
                    background: "rgba(0, 0, 0, 0.8)",
                    color: "var(--primary-color)",
                    textDecoration: "none",
                    padding: "0.6rem 1.5rem",
                    borderRadius: "50px",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    transition: "all 0.3s ease",
                    border: "1.5px solid var(--primary-color)",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    backgroundColor: "transparent"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255, 107, 0, 0.1)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(0, 0, 0, 0.8)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  🚪 Logout
                </button>
              </>
            ) : (
              <>
                {/* Login Button */}
                <Link
                  to="/login"
                  style={{
                    background: "rgba(0, 0, 0, 0.8)",
                    color: "var(--primary-color)",
                    textDecoration: "none",
                    padding: "0.6rem 1.5rem",
                    borderRadius: "50px",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    transition: "all 0.3s ease",
                    border: "1.5px solid var(--primary-color)",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255, 107, 0, 0.1)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(0, 0, 0, 0.8)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  🔑 Login
                </Link>

                {/* Register Button */}
                <Link
                  to="/register"
                  style={{
                    background: "var(--gradient)",
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
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.5)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.3)";
                  }}
                >
                  📝 Register
                </Link>
              </>
            )}
          </div>
        </div>

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
          
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 0.5; }
            50% { opacity: 1; }
          }
        `}</style>
      </nav>
    </>
  );
}

export default Navbar;