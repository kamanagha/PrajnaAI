import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../services/api";

function Dashboard() {
  const navigate = useNavigate();
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

  // Quick actions data with icons, titles, descriptions, and links
  const quickActions = [
    { 
      icon: "📤", 
      title: "Upload Materials", 
      description: "Import notes, PDFs, and resources", 
      link: "/upload", 
      color: "#FF6B00", 
      bgColor: "rgba(255, 107, 0, 0.1)",
      category: "Content Management"
    },
    { 
      icon: "📂", 
      title: "View Materials", 
      description: "Access and explore study content", 
      link: "/materials", 
      color: "#28a745", 
      bgColor: "rgba(40, 167, 69, 0.1)",
      category: "Content Management"
    },
    { 
      icon: "🔍", 
      title: "Search Materials", 
      description: "Find specific study resources", 
      link: "/materials", 
      color: "#17a2b8", 
      bgColor: "rgba(23, 162, 184, 0.1)",
      category: "Content Management"
    },
    { 
      icon: "📊", 
      title: "Analytics", 
      description: "Track your learning progress", 
      link: "#", 
      color: "#6f42c1", 
      bgColor: "rgba(111, 66, 193, 0.1)", 
      comingSoon: true,
      category: "Insights"
    },
    { 
      icon: "👥", 
      title: "Study Groups", 
      description: "Collaborate with peers", 
      link: "#", 
      color: "#fd7e14", 
      bgColor: "rgba(253, 126, 20, 0.1)", 
      comingSoon: true,
      category: "Collaboration"
    },
    { 
      icon: "🎯", 
      title: "Goals & Targets", 
      description: "Set learning milestones", 
      link: "#", 
      color: "#20c997", 
      bgColor: "rgba(32, 201, 151, 0.1)", 
      comingSoon: true,
      category: "Productivity"
    },
    { 
      icon: "📅", 
      title: "Study Planner", 
      description: "Schedule your study sessions", 
      link: "#", 
      color: "#e83e8c", 
      bgColor: "rgba(232, 62, 140, 0.1)", 
      comingSoon: true,
      category: "Productivity"
    },
    { 
      icon: "🏆", 
      title: "Achievements", 
      description: "Earn badges and rewards", 
      link: "#", 
      color: "#ffc107", 
      bgColor: "rgba(255, 193, 7, 0.1)", 
      comingSoon: true,
      category: "Gamification"
    },
    { 
      icon: "💬", 
      title: "Discussion Forum", 
      description: "Ask questions and share knowledge", 
      link: "#", 
      color: "#4a90e2", 
      bgColor: "rgba(74, 144, 226, 0.1)", 
      comingSoon: true,
      category: "Collaboration"
    },
    { 
      icon: "📝", 
      title: "Practice Tests", 
      description: "Take quizzes and assessments", 
      link: "#", 
      color: "#f39c12", 
      bgColor: "rgba(243, 156, 18, 0.1)", 
      comingSoon: true,
      category: "Assessment"
    },
    { 
      icon: "⭐", 
      title: "Favorites", 
      description: "Access your saved materials", 
      link: "#", 
      color: "#e74c3c", 
      bgColor: "rgba(231, 76, 60, 0.1)", 
      comingSoon: true,
      category: "Personal"
    },
    { 
      icon: "📱", 
      title: "Mobile App", 
      description: "Download our mobile app", 
      link: "#", 
      color: "#3498db", 
      bgColor: "rgba(52, 152, 219, 0.1)", 
      comingSoon: true,
      category: "Tools"
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

  return (
    <div style={{
      minHeight: "calc(100vh - 80px)",
      background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0d0d0d 100%)",
      fontFamily: "'Poppins', 'Segoe UI', 'Montserrat', system-ui, sans-serif",
      display: "flex",
      position: "relative"
    }}>
      {/* Sidebar Toggle Button */}
      <button
        onClick={toggleSidebar}
        style={{
          position: "fixed",
          top: "100px",
          left: sidebarOpen ? "280px" : "20px",
          zIndex: 1000,
          background: "linear-gradient(135deg, #FF6B00, #FF8C00)",
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
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
        onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
      >
        {sidebarOpen ? "◀" : "▶"}
      </button>

      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? "280px" : "0",
        background: "linear-gradient(180deg, rgba(0,0,0,0.95), rgba(20,20,20,0.98))",
        backdropFilter: "blur(10px)",
        borderRight: sidebarOpen ? "1px solid rgba(255, 140, 0, 0.3)" : "none",
        transition: "width 0.3s ease",
        overflow: "hidden",
        position: "fixed",
        top: "80px",
        left: 0,
        height: "calc(100vh - 80px)",
        zIndex: 999,
        display: "flex",
        flexDirection: "column"
      }}>
        {sidebarOpen && (
          <>
            {/* Sidebar Header */}
            <div style={{
              padding: "1.5rem",
              borderBottom: "1px solid rgba(255, 140, 0, 0.2)",
              textAlign: "center"
            }}>
              <div style={{
                fontSize: "2rem",
                marginBottom: "0.5rem"
              }}>🚀</div>
              <h3 style={{
                color: "#FFA500",
                fontSize: "1.1rem",
                fontWeight: 600,
                marginBottom: "0.25rem"
              }}>
                Quick Actions
              </h3>
              <p style={{
                color: "#a0a0a0",
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
                    color: "#FF8C00",
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
                      onClick={() => {
                        if (!action.comingSoon && action.link !== "#") {
                          navigate(action.link);
                        } else if (action.comingSoon) {
                          setActiveQuickAction(action.title);
                          setTimeout(() => setActiveQuickAction(null), 2000);
                        }
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        padding: "0.75rem",
                        marginBottom: "0.5rem",
                        borderRadius: "12px",
                        background: activeQuickAction === action.title && action.comingSoon 
                          ? "rgba(255, 193, 7, 0.2)"
                          : "rgba(255, 255, 255, 0.03)",
                        cursor: action.comingSoon ? "not-allowed" : "pointer",
                        transition: "all 0.3s ease",
                        opacity: action.comingSoon ? 0.6 : 1,
                        position: "relative"
                      }}
                      onMouseEnter={(e) => {
                        if (!action.comingSoon) {
                          e.currentTarget.style.background = "rgba(255, 140, 0, 0.1)";
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
                          color: "#a0a0a0",
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
              borderTop: "1px solid rgba(255, 140, 0, 0.2)",
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
                <span style={{ color: "#a0a0a0", fontSize: "0.7rem" }}>
                  Pro Tips Available
                </span>
              </div>
              <button
                onClick={() => {
                  alert("📚 Pro Tips:\n\n1. Upload materials regularly\n2. Use search to find content\n3. Organize by subjects\n4. Track your progress\n5. Join study groups (coming soon)");
                }}
                style={{
                  background: "rgba(255, 107, 0, 0.2)",
                  border: "1px solid #FF6B00",
                  borderRadius: "8px",
                  padding: "0.4rem 0.8rem",
                  color: "#FFA500",
                  fontSize: "0.7rem",
                  cursor: "pointer",
                  width: "100%"
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
          background: "radial-gradient(circle, rgba(255, 94, 0, 0.08) 0%, transparent 70%)",
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
          <div style={{
            background: "linear-gradient(135deg, rgba(0,0,0,0.6), rgba(20,20,20,0.8))",
            borderRadius: "20px",
            padding: "2rem",
            marginBottom: "2rem",
            border: "1px solid rgba(255, 140, 0, 0.2)",
            position: "relative",
            overflow: "hidden"
          }}>
            <div style={{
              position: "absolute",
              top: "-50%",
              right: "-10%",
              width: "300px",
              height: "300px",
              background: "radial-gradient(circle, rgba(255, 107, 0, 0.1), transparent)",
              borderRadius: "50%"
            }}></div>
            <div>
              <h1 style={{
                fontSize: "2rem",
                fontWeight: 700,
                marginBottom: "0.5rem"
              }}>
                {greeting}! <span style={{
                  background: "linear-gradient(135deg, #FF6B00, #FF8C00, #FFA500)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  color: "transparent"
                }}>{name || "Student"}</span> 👋
              </h1>
              <p style={{
                color: "#a0a0a0",
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
              <p style={{ color: "#FFA500", fontSize: "0.95rem" }}>
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
            <div style={{
              background: "linear-gradient(135deg, rgba(0,0,0,0.6), rgba(20,20,20,0.8))",
              borderRadius: "16px",
              padding: "1.2rem",
              textAlign: "center",
              border: "1px solid rgba(255, 140, 0, 0.2)",
              transition: "transform 0.3s ease"
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}>
              <div style={{ fontSize: "2rem" }}>📚</div>
              <div style={{ color: "#FFA500", fontSize: "1.8rem", fontWeight: 700 }}>{stats.totalMaterials}</div>
              <div style={{ color: "#a0a0a0", fontSize: "0.85rem" }}>Total Materials</div>
            </div>
            
            <div style={{
              background: "linear-gradient(135deg, rgba(0,0,0,0.6), rgba(20,20,20,0.8))",
              borderRadius: "16px",
              padding: "1.2rem",
              textAlign: "center",
              border: "1px solid rgba(66, 133, 244, 0.2)",
              transition: "transform 0.3s ease"
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}>
              <div style={{ fontSize: "2rem" }}>👤</div>
              <div style={{ color: "#4285F4", fontSize: "1.8rem", fontWeight: 700 }}>{stats.myMaterials}</div>
              <div style={{ color: "#a0a0a0", fontSize: "0.85rem" }}>My Materials</div>
            </div>
            
            <div style={{
              background: "linear-gradient(135deg, rgba(0,0,0,0.6), rgba(20,20,20,0.8))",
              borderRadius: "16px",
              padding: "1.2rem",
              textAlign: "center",
              border: "1px solid rgba(40, 167, 69, 0.2)",
              transition: "transform 0.3s ease"
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}>
              <div style={{ fontSize: "2rem" }}>📄</div>
              <div style={{ color: "#28a745", fontSize: "1.8rem", fontWeight: 700 }}>{stats.pdfCount}</div>
              <div style={{ color: "#a0a0a0", fontSize: "0.85rem" }}>PDF Documents</div>
            </div>
            
            <div style={{
              background: "linear-gradient(135deg, rgba(0,0,0,0.6), rgba(20,20,20,0.8))",
              borderRadius: "16px",
              padding: "1.2rem",
              textAlign: "center",
              border: "1px solid rgba(23, 162, 184, 0.2)",
              transition: "transform 0.3s ease"
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}>
              <div style={{ fontSize: "2rem" }}>📝</div>
              <div style={{ color: "#17a2b8", fontSize: "1.8rem", fontWeight: 700 }}>{stats.docCount + stats.noteCount}</div>
              <div style={{ color: "#a0a0a0", fontSize: "0.85rem" }}>Documents & Notes</div>
            </div>
          </div>

          {/* Recent Uploads Section */}
          <div style={{
            background: "linear-gradient(135deg, rgba(0,0,0,0.6), rgba(20,20,20,0.8))",
            borderRadius: "20px",
            padding: "1.5rem",
            marginBottom: "2rem",
            border: "1px solid rgba(255, 140, 0, 0.2)"
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.5rem",
              flexWrap: "wrap",
              gap: "1rem"
            }}>
              <h3 style={{
                color: "#FFA500",
                fontSize: "1.3rem",
                fontWeight: 600,
                margin: 0
              }}>
                📋 Recent Uploads
              </h3>
              <Link
                to="/materials"
                style={{
                  color: "#FF8C00",
                  textDecoration: "none",
                  fontSize: "0.85rem",
                  transition: "color 0.3s ease"
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = "#FFA500"}
                onMouseLeave={(e) => e.currentTarget.style.color = "#FF8C00"}
              >
                View All →
              </Link>
            </div>
            
            {loading ? (
              <div style={{ textAlign: "center", padding: "2rem" }}>
                <div className="spinner"></div>
                <p style={{ color: "#a0a0a0", marginTop: "1rem" }}>Loading recent uploads...</p>
              </div>
            ) : stats.recentUploads.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {stats.recentUploads.map((material, index) => (
                  <div
                    key={material.id}
                    onClick={() => navigate(`/material/${material.id}`)}
                    style={{
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
                    }}
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
                          <div style={{ color: "#FFA500", fontSize: "0.75rem" }}>{material.subject}</div>
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
                <p style={{ color: "#a0a0a0" }}>No uploads yet. Start by uploading your first material!</p>
                <Link
                  to="/upload"
                  style={{
                    display: "inline-block",
                    marginTop: "1rem",
                    padding: "0.5rem 1rem",
                    background: "linear-gradient(135deg, #FF6B00, #FF8C00)",
                    borderRadius: "8px",
                    color: "white",
                    textDecoration: "none"
                  }}
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
            <div style={{
              background: "linear-gradient(135deg, rgba(0,0,0,0.6), rgba(20,20,20,0.8))",
              borderRadius: "16px",
              padding: "1.5rem",
              border: "1px solid rgba(255, 140, 0, 0.2)"
            }}>
              <h3 style={{
                color: "#FFA500",
                fontSize: "1.2rem",
                fontWeight: 600,
                marginBottom: "1rem"
              }}>
                💡 Learning Tips
              </h3>
              <ul style={{ color: "#a0a0a0", fontSize: "0.85rem", lineHeight: 1.8, paddingLeft: "1.2rem" }}>
                <li>Upload your study materials to access them anytime</li>
                <li>Organize content by subject for easy retrieval</li>
                <li>Use search to quickly find specific topics</li>
                <li>Review your uploaded materials regularly</li>
                <li>Share resources with study groups (coming soon)</li>
              </ul>
            </div>

            {/* Quick Stats */}
            <div style={{
              background: "linear-gradient(135deg, rgba(0,0,0,0.6), rgba(20,20,20,0.8))",
              borderRadius: "16px",
              padding: "1.5rem",
              border: "1px solid rgba(255, 140, 0, 0.2)"
            }}>
              <h3 style={{
                color: "#FFA500",
                fontSize: "1.2rem",
                fontWeight: 600,
                marginBottom: "1rem"
              }}>
                📊 Quick Stats
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#a0a0a0" }}>Storage Used:</span>
                  <span style={{ color: "#FFA500", fontWeight: 600 }}>
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
                    background: "linear-gradient(90deg, #FF6B00, #FF8C00)",
                    borderRadius: "4px"
                  }}></div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem" }}>
                  <span style={{ color: "#a0a0a0" }}>Active Materials:</span>
                  <span style={{ color: "#28a745", fontWeight: 600 }}>{stats.totalMaterials}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#a0a0a0" }}>Completion Rate:</span>
                  <span style={{ color: "#17a2b8", fontWeight: 600 }}>
                    {stats.totalMaterials > 0 ? Math.min(100, Math.floor((stats.myMaterials / stats.totalMaterials) * 100)) : 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* Need Help? */}
            <div style={{
              background: "linear-gradient(135deg, rgba(0,0,0,0.6), rgba(20,20,20,0.8))",
              borderRadius: "16px",
              padding: "1.5rem",
              border: "1px solid rgba(255, 140, 0, 0.2)"
            }}>
              <h3 style={{
                color: "#FFA500",
                fontSize: "1.2rem",
                fontWeight: 600,
                marginBottom: "1rem"
              }}>
                ❓ Need Help?
              </h3>
              <p style={{ color: "#a0a0a0", fontSize: "0.85rem", marginBottom: "1rem" }}>
                Check out our documentation or contact support for assistance with managing your study materials.
              </p>
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <button
                  style={{
                    padding: "0.5rem 1rem",
                    background: "rgba(255, 107, 0, 0.2)",
                    border: "1px solid #FF6B00",
                    borderRadius: "8px",
                    color: "#FFA500",
                    cursor: "pointer",
                    fontSize: "0.85rem"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255, 107, 0, 0.3)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255, 107, 0, 0.2)"}
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
                    fontSize: "0.85rem"
                  }}
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
          border: 3px solid rgba(255, 140, 0, 0.3);
          border-top: 3px solid #FF8C00;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        /* Custom scrollbar for sidebar */
        .sidebar-scroll::-webkit-scrollbar {
          width: 5px;
        }
        
        .sidebar-scroll::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        
        .sidebar-scroll::-webkit-scrollbar-thumb {
          background: #FF8C00;
          border-radius: 10px;
        }
        
        .sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: #FFA500;
        }
      `}</style>
    </div>
  );
}

export default Dashboard;