import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../services/api";
import { useTheme } from "../context/ThemeContext";

function Dashboard() {
  const navigate = useNavigate();
  const { currentTheme, themes } = useTheme();
  const theme = themes[currentTheme];
  
  const [name, setName] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState({
    totalMaterials: 0,
    myMaterials: 0,
    pdfCount: 0,
    docCount: 0,
    noteCount: 0,
    recentUploads: [],
    totalDownloads: 0,
    totalViews: 0
  });
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeQuickAction, setActiveQuickAction] = useState(null);

  useEffect(() => {
    const storedName = localStorage.getItem("name");
    const userId = localStorage.getItem("user_id");
    
    if (storedName) {
      setName(storedName);
    }
    
    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
    
    // Check sidebar preference from localStorage
    const savedSidebarState = localStorage.getItem("sidebarOpen");
    if (savedSidebarState !== null) {
      setSidebarOpen(savedSidebarState === "true");
    }
    
    // Fetch dashboard statistics
    fetchDashboardStats(userId);
    
    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);

  const fetchDashboardStats = async (userId) => {
    try {
      setLoading(true);
      const res = await API.get("/materials/view/");
      const materials = res.data;
      
      // Calculate statistics
      const myMaterials = materials.filter(m => String(m.user_id) === String(userId));
      const pdfCount = materials.filter(m => m.file_type === "PDF").length;
      const docCount = materials.filter(m => m.file_type === "DOC").length;
      const noteCount = materials.filter(m => m.file_type === "NOTE").length;
      
      // Get recent uploads (last 5)
      const recentUploads = [...materials]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);
      
      setStats({
        totalMaterials: materials.length,
        myMaterials: myMaterials.length,
        pdfCount,
        docCount,
        noteCount,
        recentUploads,
        totalDownloads: Math.floor(Math.random() * 1000),
        totalViews: Math.floor(Math.random() * 5000)
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSidebar = () => {
    const newState = !sidebarOpen;
    setSidebarOpen(newState);
    localStorage.setItem("sidebarOpen", newState);
  };

  // Quick actions data with working links
  const quickActions = [
    { 
      icon: "📤", 
      title: "Upload Materials", 
      description: "Import notes, PDFs, and resources", 
      link: "/upload", 
      color: theme.primary, 
      comingSoon: false,
      category: "📁 Content Management"
    },
    { 
      icon: "📂", 
      title: "View Materials", 
      description: "Access and explore study content", 
      link: "/materials", 
      color: "#28a745", 
      comingSoon: false,
      category: "📁 Content Management"
    },
    { 
      icon: "🔍", 
      title: "Search Materials", 
      description: "Find specific study resources", 
      link: "/materials", 
      color: "#17a2b8", 
      comingSoon: false,
      category: "📁 Content Management"
    },
    { 
      icon: "📊", 
      title: "Analytics Dashboard", 
      description: "Track your learning progress", 
      link: "/analytics", 
      color: "#6f42c1", 
      comingSoon: false,
      category: "📈 Insights & Analytics"
    },
    { 
      icon: "📈", 
      title: "Progress Report", 
      description: "View detailed analytics", 
      link: "/analytics", 
      color: "#00b894", 
      comingSoon: false,
      category: "📈 Insights & Analytics"
    },
    { 
      icon: "👥", 
      title: "Study Groups", 
      description: "Collaborate with peers", 
      link: "/study-groups", 
      color: "#fd7e14", 
      comingSoon: false,
      category: "🤝 Collaboration"
    },
    { 
      icon: "💬", 
      title: "Discussion Forum", 
      description: "Ask questions and share knowledge", 
      link: "/study-groups", 
      color: "#4a90e2", 
      comingSoon: false,
      category: "🤝 Collaboration"
    },
    { 
      icon: "🎯", 
      title: "Goals & Targets", 
      description: "Set learning milestones", 
      link: "#", 
      color: "#20c997", 
      comingSoon: true,
      category: "🎯 Productivity"
    },
    { 
      icon: "📅", 
      title: "Study Planner", 
      description: "Schedule your study sessions", 
      link: "#", 
      color: "#e83e8c", 
      comingSoon: true,
      category: "🎯 Productivity"
    },
    { 
      icon: "🏆", 
      title: "Achievements", 
      description: "Earn badges and rewards", 
      link: "#", 
      color: "#ffc107", 
      comingSoon: true,
      category: "🎮 Gamification"
    },
    { 
      icon: "📝", 
      title: "Practice Tests", 
      description: "Take quizzes and assessments", 
      link: "#", 
      color: "#f39c12", 
      comingSoon: true,
      category: "📝 Assessment"
    },
    { 
      icon: "⭐", 
      title: "Favorites", 
      description: "Access your saved materials", 
      link: "#", 
      color: "#e74c3c", 
      comingSoon: true,
      category: "❤️ Personal"
    },
    { 
      icon: "🎨", 
      title: "Theme Customizer", 
      description: "Change app appearance", 
      link: "#", 
      color: "#e84393", 
      comingSoon: true,
      category: "⚙️ Settings"
    },
    { 
      icon: "📱", 
      title: "Mobile App", 
      description: "Download our mobile app", 
      link: "#", 
      color: "#3498db", 
      comingSoon: true,
      category: "🔧 Tools"
    },
    { 
      icon: "❓", 
      title: "Help & Support", 
      description: "Get assistance", 
      link: "#", 
      color: "#95a5a6", 
      comingSoon: true,
      category: "🔧 Tools"
    }
  ];

  // Group quick actions by category
  const groupedActions = quickActions.reduce((groups, action) => {
    if (!groups[action.category]) {
      groups[action.category] = [];
    }
    groups[action.category].push(action);
    return groups;
  }, {});

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  // Dynamic styles based on theme
  const styles = {
    container: {
      minHeight: "calc(100vh - 80px)",
      background: `linear-gradient(135deg, ${theme.background} 0%, ${theme.surface} 50%, ${theme.background} 100%)`,
      fontFamily: "'Poppins', 'Segoe UI', 'Montserrat', system-ui, sans-serif",
      display: "flex",
      position: "relative",
      transition: "all 0.3s ease"
    },
    toggleButton: {
      position: "fixed",
      top: "100px",
      left: sidebarOpen ? "280px" : "20px",
      zIndex: 1000,
      background: theme.gradient,
      border: "none",
      borderRadius: "8px",
      padding: "10px",
      color: "white",
      cursor: "pointer",
      transition: "all 0.3s ease",
      boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
      display: "flex",
      alignItems: "center",
      gap: "5px"
    },
    sidebar: {
      width: sidebarOpen ? "280px" : "0",
      background: "linear-gradient(180deg, rgba(0,0,0,0.95), rgba(20,20,20,0.98))",
      backdropFilter: "blur(10px)",
      borderRight: sidebarOpen ? `1px solid ${theme.primary}4D` : "none",
      transition: "width 0.3s ease",
      overflow: "hidden",
      position: "fixed",
      top: "80px",
      left: 0,
      height: "calc(100vh - 80px)",
      zIndex: 999,
      display: "flex",
      flexDirection: "column"
    },
    welcomeSection: {
      background: `linear-gradient(135deg, rgba(0,0,0,0.6), rgba(20,20,20,0.8))`,
      borderRadius: "20px",
      padding: "2rem",
      marginBottom: "2rem",
      border: `1px solid ${theme.primary}33`,
      position: "relative",
      overflow: "hidden"
    },
    statCard: (borderColor) => ({
      background: `linear-gradient(135deg, rgba(0,0,0,0.6), rgba(20,20,20,0.8))`,
      borderRadius: "16px",
      padding: "1.2rem",
      textAlign: "center",
      border: `1px solid ${borderColor}`,
      transition: "transform 0.3s ease",
      cursor: "pointer"
    }),
    recentUploadsSection: {
      background: `linear-gradient(135deg, rgba(0,0,0,0.6), rgba(20,20,20,0.8))`,
      borderRadius: "20px",
      padding: "1.5rem",
      marginBottom: "2rem",
      border: `1px solid ${theme.primary}33`
    },
    uploadItem: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "1rem",
      background: "rgba(255, 255, 255, 0.03)",
      borderRadius: "12px",
      cursor: "pointer",
      transition: "all 0.3s ease",
      flexWrap: "wrap",
      gap: "0.5rem"
    },
    infoCard: {
      background: `linear-gradient(135deg, rgba(0,0,0,0.6), rgba(20,20,20,0.8))`,
      borderRadius: "16px",
      padding: "1.5rem",
      border: `1px solid ${theme.primary}33`
    }
  };

  const handleNavigation = (link, comingSoon) => {
    if (comingSoon) {
      setActiveQuickAction(link);
      setTimeout(() => setActiveQuickAction(null), 2000);
    } else if (link && link !== "#") {
      navigate(link);
    }
  };

  return (
    <div style={styles.container}>
      {/* Sidebar Toggle Button */}
      <button
        onClick={toggleSidebar}
        style={styles.toggleButton}
        onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
        onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
      >
        {sidebarOpen ? "◀" : "▶"}
      </button>

      {/* Sidebar */}
      <div style={styles.sidebar}>
        {sidebarOpen && (
          <>
            {/* Sidebar Header */}
            <div style={{
              padding: "1.5rem",
              borderBottom: `1px solid ${theme.primary}33`,
              textAlign: "center"
            }}>
              <div style={{
                fontSize: "2rem",
                marginBottom: "0.5rem"
              }}>🚀</div>
              <h3 style={{
                color: theme.primary,
                fontSize: "1.1rem",
                fontWeight: 600,
                marginBottom: "0.25rem"
              }}>
                Quick Actions
              </h3>
              <p style={{
                color: theme.text,
                opacity: 0.7,
                fontSize: "0.7rem"
              }}>
                Navigate & Manage
              </p>
            </div>

            {/* Sidebar Content - Scrollable */}
            <div style={{
              flex: 1,
              overflowY: "auto",
              padding: "1rem"
            }}>
              {Object.entries(groupedActions).map(([category, actions]) => (
                <div key={category} style={{ marginBottom: "1.5rem" }}>
                  <h4 style={{
                    color: theme.primary,
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    marginBottom: "0.75rem",
                    paddingLeft: "0.5rem"
                  }}>
                    {category}
                  </h4>
                  {actions.map((action, index) => (
                    <div
                      key={index}
                      onClick={() => handleNavigation(action.link, action.comingSoon)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        padding: "0.75rem",
                        marginBottom: "0.5rem",
                        borderRadius: "12px",
                        background: activeQuickAction === action.link && action.comingSoon 
                          ? "rgba(255, 193, 7, 0.2)"
                          : "rgba(255, 255, 255, 0.03)",
                        cursor: action.comingSoon ? "not-allowed" : "pointer",
                        transition: "all 0.3s ease",
                        opacity: action.comingSoon ? 0.6 : 1,
                        position: "relative"
                      }}
                      onMouseEnter={(e) => {
                        if (!action.comingSoon) {
                          e.currentTarget.style.background = `${theme.primary}1A`;
                          e.currentTarget.style.transform = "translateX(5px)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!action.comingSoon) {
                          e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
                          e.currentTarget.style.transform = "translateX(0)";
                        }
                      }}
                    >
                      <span style={{ fontSize: "1.2rem" }}>{action.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          color: "#ffffff",
                          fontSize: "0.85rem",
                          fontWeight: 500
                        }}>
                          {action.title}
                        </div>
                        <div style={{
                          color: theme.text,
                          opacity: 0.7,
                          fontSize: "0.7rem"
                        }}>
                          {action.description}
                        </div>
                      </div>
                      {action.comingSoon && (
                        <span style={{
                          fontSize: "0.6rem",
                          background: "rgba(255, 193, 7, 0.2)",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          color: "#ffc107"
                        }}>
                          Soon
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Sidebar Footer */}
            <div style={{
              padding: "1rem",
              borderTop: `1px solid ${theme.primary}33`,
              textAlign: "center"
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                marginBottom: "0.5rem"
              }}>
                <span style={{ fontSize: "0.8rem" }}>💡</span>
                <span style={{ color: theme.text, opacity: 0.7, fontSize: "0.7rem" }}>
                  Pro Tips Available
                </span>
              </div>
              <button
                onClick={() => {
                  alert("📚 Pro Tips:\n\n1. Upload materials regularly\n2. Use search to find content\n3. Organize by subjects\n4. Track your progress\n5. Visit Analytics page for insights\n6. Join study groups to collaborate");
                }}
                style={{
                  background: `${theme.primary}33`,
                  border: `1px solid ${theme.primary}`,
                  borderRadius: "8px",
                  padding: "0.4rem 0.8rem",
                  color: theme.primary,
                  fontSize: "0.7rem",
                  cursor: "pointer",
                  width: "100%",
                  transition: "all 0.3s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `${theme.primary}4D`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = `${theme.primary}33`;
                }}
              >
                View Learning Tips
              </button>
            </div>
          </>
        )}
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        marginLeft: sidebarOpen ? "280px" : "0",
        transition: "margin-left 0.3s ease",
        padding: "2rem 1.5rem",
        width: "100%"
      }}>
        {/* Decorative background */}
        <div style={{
          position: "fixed",
          top: "10%",
          right: "-5%",
          width: "400px",
          height: "400px",
          background: `radial-gradient(circle, ${theme.primary}14 0%, transparent 70%)`,
          borderRadius: "50%",
          filter: "blur(80px)",
          pointerEvents: "none"
        }}></div>

        <div style={{
          maxWidth: "1400px",
          margin: "0 auto",
          position: "relative",
          zIndex: 2
        }}>
          {/* Welcome Section with Time */}
          <div style={styles.welcomeSection}>
            <div style={{
              position: "absolute",
              top: "-50%",
              right: "-10%",
              width: "300px",
              height: "300px",
              background: `radial-gradient(circle, ${theme.primary}1A, transparent)`,
              borderRadius: "50%"
            }}></div>
            <div>
              <h1 style={{
                fontSize: "2rem",
                fontWeight: 700,
                marginBottom: "0.5rem",
                color: theme.text
              }}>
                {greeting}! <span style={{ color: theme.primary }}>{name || "Student"}</span> 👋
              </h1>
              <p style={{
                color: theme.text,
                opacity: 0.8,
                fontSize: "1rem",
                marginBottom: "0.5rem"
              }}>
                {currentTime.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })} • {currentTime.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
              <p style={{ color: theme.primary, fontSize: "0.95rem" }}>
                Your smart learning platform to import, export and manage study materials effortlessly.
              </p>
            </div>
          </div>

          {/* Statistics Cards */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem"
          }}>
            <div
              style={styles.statCard(`${theme.primary}33`)}
              onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
              onClick={() => navigate("/materials")}
            >
              <div style={{ fontSize: "2rem" }}>📚</div>
              <div style={{ color: theme.primary, fontSize: "1.8rem", fontWeight: 700 }}>{stats.totalMaterials}</div>
              <div style={{ color: theme.text, opacity: 0.7, fontSize: "0.85rem" }}>Total Materials</div>
            </div>
            
            <div
              style={styles.statCard("rgba(66, 133, 244, 0.2)")}
              onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
            >
              <div style={{ fontSize: "2rem" }}>👤</div>
              <div style={{ color: "#4285F4", fontSize: "1.8rem", fontWeight: 700 }}>{stats.myMaterials}</div>
              <div style={{ color: theme.text, opacity: 0.7, fontSize: "0.85rem" }}>My Materials</div>
            </div>
            
            <div
              style={styles.statCard("rgba(40, 167, 69, 0.2)")}
              onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
            >
              <div style={{ fontSize: "2rem" }}>📄</div>
              <div style={{ color: "#28a745", fontSize: "1.8rem", fontWeight: 700 }}>{stats.pdfCount}</div>
              <div style={{ color: theme.text, opacity: 0.7, fontSize: "0.85rem" }}>PDF Documents</div>
            </div>
            
            <div
              style={styles.statCard("rgba(23, 162, 184, 0.2)")}
              onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
            >
              <div style={{ fontSize: "2rem" }}>📝</div>
              <div style={{ color: "#17a2b8", fontSize: "1.8rem", fontWeight: 700 }}>{stats.docCount + stats.noteCount}</div>
              <div style={{ color: theme.text, opacity: 0.7, fontSize: "0.85rem" }}>Documents & Notes</div>
            </div>
          </div>

          {/* Quick Action Buttons Row */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem"
          }}>
            <button
              onClick={() => navigate("/upload")}
              style={{
                padding: "1rem",
                background: theme.gradient,
                border: "none",
                borderRadius: "12px",
                color: "white",
                cursor: "pointer",
                fontWeight: 600,
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-3px)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
            >
              📤 Upload Material
            </button>
            
            <button
              onClick={() => navigate("/materials")}
              style={{
                padding: "1rem",
                background: "rgba(40, 167, 69, 0.2)",
                border: `1px solid #28a745`,
                borderRadius: "12px",
                color: "#28a745",
                cursor: "pointer",
                fontWeight: 600,
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-3px)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
            >
              📂 View Materials
            </button>
            
            <button
              onClick={() => navigate("/analytics")}
              style={{
                padding: "1rem",
                background: "rgba(111, 66, 193, 0.2)",
                border: `1px solid #6f42c1`,
                borderRadius: "12px",
                color: "#6f42c1",
                cursor: "pointer",
                fontWeight: 600,
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-3px)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
            >
              📊 Analytics
            </button>
            
            <button
              onClick={() => navigate("/study-groups")}
              style={{
                padding: "1rem",
                background: "rgba(253, 126, 20, 0.2)",
                border: `1px solid #fd7e14`,
                borderRadius: "12px",
                color: "#fd7e14",
                cursor: "pointer",
                fontWeight: 600,
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-3px)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
            >
              👥 Study Groups
            </button>
          </div>

          {/* Recent Uploads Section */}
          <div style={styles.recentUploadsSection}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.5rem",
              flexWrap: "wrap",
              gap: "1rem"
            }}>
              <h3 style={{
                color: theme.primary,
                fontSize: "1.3rem",
                fontWeight: 600,
                margin: 0
              }}>
                📋 Recent Uploads
              </h3>
              <Link
                to="/materials"
                style={{
                  color: theme.primary,
                  textDecoration: "none",
                  fontSize: "0.85rem",
                  transition: "color 0.3s ease"
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = theme.secondary}
                onMouseLeave={(e) => e.currentTarget.style.color = theme.primary}
              >
                View All Materials →
              </Link>
            </div>
            
            {loading ? (
              <div style={{ textAlign: "center", padding: "2rem" }}>
                <div className="spinner" style={{ borderTopColor: theme.primary }}></div>
                <p style={{ color: theme.text, opacity: 0.7, marginTop: "1rem" }}>Loading recent uploads...</p>
              </div>
            ) : stats.recentUploads.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {stats.recentUploads.map((material, index) => (
                  <div
                    key={material.id}
                    onClick={() => navigate(`/material/${material.id}`)}
                    style={styles.uploadItem}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                      e.currentTarget.style.transform = "translateX(5px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
                      e.currentTarget.style.transform = "translateX(0)";
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", flex: 1 }}>
                      <span style={{ fontSize: "1.5rem" }}>
                        {material.file_type === "PDF" ? "📄" : 
                         material.file_type === "DOC" ? "📝" : "📘"}
                      </span>
                      <div>
                        <div style={{ color: "#ffffff", fontWeight: 500 }}>{material.title}</div>
                        {material.subject && (
                          <div style={{ color: theme.primary, fontSize: "0.75rem" }}>{material.subject}</div>
                        )}
                      </div>
                    </div>
                    <div style={{ color: "#666", fontSize: "0.75rem" }}>
                      {formatDate(material.created_at)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "2rem" }}>
                <p style={{ color: theme.text, opacity: 0.7 }}>No uploads yet. Start by uploading your first material!</p>
                <Link
                  to="/upload"
                  style={{
                    display: "inline-block",
                    marginTop: "1rem",
                    padding: "0.5rem 1rem",
                    background: theme.gradient,
                    borderRadius: "8px",
                    color: "white",
                    textDecoration: "none",
                    transition: "all 0.3s ease"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                  onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                >
                  ➕ Upload Now
                </Link>
              </div>
            )}
          </div>

          {/* Learning Progress & Tips Section */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1.5rem"
          }}>
            {/* Learning Tips */}
            <div style={styles.infoCard}>
              <h3 style={{
                color: theme.primary,
                fontSize: "1.2rem",
                fontWeight: 600,
                marginBottom: "1rem"
              }}>
                💡 Learning Tips
              </h3>
              <ul style={{ color: theme.text, opacity: 0.8, fontSize: "0.85rem", lineHeight: 1.8, paddingLeft: "1.2rem" }}>
                <li>Upload your study materials to access them anytime</li>
                <li>Organize content by subject for easy retrieval</li>
                <li>Use search to quickly find specific topics</li>
                <li>Review your uploaded materials regularly</li>
                <li>Check Analytics page for insights on your learning</li>
                <li>Join Study Groups to collaborate with peers</li>
              </ul>
            </div>

            {/* Quick Stats */}
            <div style={styles.infoCard}>
              <h3 style={{
                color: theme.primary,
                fontSize: "1.2rem",
                fontWeight: 600,
                marginBottom: "1rem"
              }}>
                📊 Quick Stats
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: theme.text, opacity: 0.8 }}>Storage Used:</span>
                  <span style={{ color: theme.primary, fontWeight: 600 }}>
                    {Math.min(100, Math.floor((stats.totalMaterials / 50) * 100))}%
                  </span>
                </div>
                <div style={{
                  width: "100%",
                  height: "8px",
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: "4px",
                  overflow: "hidden"
                }}>
                  <div style={{
                    width: `${Math.min(100, Math.floor((stats.totalMaterials / 50) * 100))}%`,
                    height: "100%",
                    background: theme.gradient,
                    borderRadius: "4px"
                  }}></div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem" }}>
                  <span style={{ color: theme.text, opacity: 0.8 }}>Active Materials:</span>
                  <span style={{ color: "#28a745", fontWeight: 600 }}>{stats.totalMaterials}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: theme.text, opacity: 0.8 }}>Completion Rate:</span>
                  <span style={{ color: "#17a2b8", fontWeight: 600 }}>
                    {stats.totalMaterials > 0 ? Math.min(100, Math.floor((stats.myMaterials / stats.totalMaterials) * 100)) : 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* Need Help? */}
            <div style={styles.infoCard}>
              <h3 style={{
                color: theme.primary,
                fontSize: "1.2rem",
                fontWeight: 600,
                marginBottom: "1rem"
              }}>
                ❓ Need Help?
              </h3>
              <p style={{ color: theme.text, opacity: 0.8, fontSize: "0.85rem", marginBottom: "1rem" }}>
                Check out our documentation or contact support for assistance with managing your study materials.
              </p>
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <button
                  style={{
                    padding: "0.5rem 1rem",
                    background: `${theme.primary}33`,
                    border: `1px solid ${theme.primary}`,
                    borderRadius: "8px",
                    color: theme.primary,
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    transition: "all 0.3s ease"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = `${theme.primary}4D`}
                  onMouseLeave={(e) => e.currentTarget.style.background = `${theme.primary}33`}
                  onClick={() => alert("📚 Documentation coming soon! Stay tuned for detailed guides.")}
                >
                  📖 Documentation
                </button>
                <button
                  style={{
                    padding: "0.5rem 1rem",
                    background: "rgba(108, 117, 125, 0.2)",
                    border: "1px solid #6c757d",
                    borderRadius: "8px",
                    color: "#a0a0a0",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    transition: "all 0.3s ease"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(108, 117, 125, 0.3)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "rgba(108, 117, 125, 0.2)"}
                  onClick={() => alert("📧 Support coming soon! For now, please check our FAQ section.")}
                >
                  💬 Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .spinner {
          display: inline-block;
          width: 30px;
          height: 30px;
          border: 3px solid ${theme.primary}4D;
          border-top: 3px solid ${theme.primary};
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        /* Custom scrollbar for sidebar */
        ::-webkit-scrollbar {
          width: 5px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: ${theme.primary};
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: ${theme.secondary};
        }
      `}</style>
    </div>
  );
}

export default Dashboard;