import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import { useTheme } from "../context/ThemeContext";

function Analytics() {
  const navigate = useNavigate();
  const { currentTheme, themes } = useTheme();
  const theme = themes[currentTheme];
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    totalMaterials: 0,
    myMaterials: 0,
    totalViews: 0,
    totalDownloads: 0,
    materialsByType: { PDF: 0, DOC: 0, NOTE: 0, IMAGE: 0 },
    materialsBySubject: {},
    monthlyUploads: [],
    recentActivity: [],
    topMaterials: [],
    storageUsed: 0,
    storageLimit: 500, // MB
    engagementRate: 0,
    activeDays: 0,
    completionRate: 0,
    peakUsageHours: [],
    userGrowth: [],
    subjectDistribution: []
  });
  
  const [timeRange, setTimeRange] = useState("month"); // week, month, year, all
  const [selectedChart, setSelectedChart] = useState("overview");
  const [activeQuickAction, setActiveQuickAction] = useState(null);

  useEffect(() => {
    const savedSidebarState = localStorage.getItem("sidebarOpen");
    if (savedSidebarState !== null) {
      setSidebarOpen(savedSidebarState === "true");
    }
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const res = await API.get("/materials/view/");
      const materials = res.data;
      const userId = localStorage.getItem("user_id");
      
      const myMaterials = materials.filter(m => String(m.user_id) === String(userId));
      
      // Calculate materials by type
      const materialsByType = {
        PDF: materials.filter(m => m.file_type === "PDF").length,
        DOC: materials.filter(m => m.file_type === "DOC").length,
        NOTE: materials.filter(m => m.file_type === "NOTE").length,
        IMAGE: materials.filter(m => m.file_type === "IMAGE").length
      };
      
      // Calculate materials by subject
      const materialsBySubject = {};
      materials.forEach(m => {
        if (m.subject) {
          materialsBySubject[m.subject] = (materialsBySubject[m.subject] || 0) + 1;
        }
      });
      
      // Generate monthly uploads data (last 6 months)
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monthlyUploads = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthName = months[date.getMonth()];
        const count = materials.filter(m => {
          const createdDate = new Date(m.created_at);
          return createdDate.getMonth() === date.getMonth() && 
                 createdDate.getFullYear() === date.getFullYear();
        }).length;
        monthlyUploads.push({ month: monthName, uploads: count, views: Math.floor(count * 5 + Math.random() * 50) });
      }
      
      // Get top materials by views (simulated)
      const topMaterials = [...materials]
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 5)
        .map(m => ({ ...m, views: m.views || Math.floor(Math.random() * 500) + 50 }));
      
      // Recent activity
      const recentActivity = [...materials]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 10)
        .map(m => ({
          id: m.id,
          title: m.title,
          type: m.file_type,
          date: m.created_at,
          action: "uploaded"
        }));
      
      // Peak usage hours (simulated)
      const peakUsageHours = [
        { hour: "9 AM", activity: 65 },
        { hour: "10 AM", activity: 80 },
        { hour: "11 AM", activity: 75 },
        { hour: "12 PM", activity: 55 },
        { hour: "2 PM", activity: 70 },
        { hour: "3 PM", activity: 85 },
        { hour: "4 PM", activity: 78 },
        { hour: "5 PM", activity: 60 },
        { hour: "7 PM", activity: 45 },
        { hour: "8 PM", activity: 40 }
      ];
      
      // Subject distribution for pie chart
      const subjectDistribution = Object.entries(materialsBySubject)
        .map(([name, value]) => ({ name, value }))
        .slice(0, 6);
      
      setAnalyticsData({
        totalMaterials: materials.length,
        myMaterials: myMaterials.length,
        totalViews: Math.floor(Math.random() * 5000) + 1000,
        totalDownloads: Math.floor(Math.random() * 2000) + 500,
        materialsByType,
        materialsBySubject,
        monthlyUploads,
        recentActivity,
        topMaterials,
        storageUsed: Math.floor(materials.length * 2.5),
        storageLimit: 500,
        engagementRate: materials.length > 0 ? Math.min(85, Math.floor((myMaterials.length / materials.length) * 100)) : 0,
        activeDays: Math.floor(Math.random() * 25) + 5,
        completionRate: Math.floor(Math.random() * 60) + 20,
        peakUsageHours,
        userGrowth: [12, 19, 15, 25, 22, 30, 28, 35, 42, 48, 55, 62],
        subjectDistribution
      });
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSidebar = () => {
    const newState = !sidebarOpen;
    setSidebarOpen(newState);
    localStorage.setItem("sidebarOpen", newState);
  };

  // Quick actions data
  const quickActions = [
    { icon: "📤", title: "Upload Materials", description: "Add new study content", link: "/upload", category: "Content" },
    { icon: "📂", title: "View Materials", description: "Browse your library", link: "/materials", category: "Content" },
    { icon: "📊", title: "Analytics", description: "Track your progress", link: "/analytics", category: "Insights" },
    { icon: "🏆", title: "Leaderboard", description: "Compare with peers", link: "#", comingSoon: true, category: "Social" },
    { icon: "⭐", title: "Recommendations", description: "Personalized suggestions", link: "#", comingSoon: true, category: "AI" }
  ];

  const groupedActions = quickActions.reduce((groups, action) => {
    if (!groups[action.category]) groups[action.category] = [];
    groups[action.category].push(action);
    return groups;
  }, {});

  // Helper functions
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case "PDF": return "📄";
      case "DOC": return "📝";
      case "NOTE": return "📘";
      default: return "📁";
    }
  };

  const getTypeColor = (type) => {
    switch(type) {
      case "PDF": return "#FF4444";
      case "DOC": return "#4285F4";
      case "NOTE": return "#4CAF50";
      default: return theme.primary;
    }
  };

  // Calculate max value for charts
  const maxUploads = Math.max(...analyticsData.monthlyUploads.map(d => d.uploads), 10);
  const maxViews = Math.max(...analyticsData.monthlyUploads.map(d => d.views), 50);

  // Styles
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
      boxShadow: "0 2px 10px rgba(0,0,0,0.3)"
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
    statCard: (bgColor) => ({
      background: `linear-gradient(135deg, rgba(0,0,0,0.6), rgba(20,20,20,0.8))`,
      borderRadius: "16px",
      padding: "1.2rem",
      border: `1px solid ${bgColor || theme.primary}33`,
      transition: "transform 0.3s ease"
    }),
    chartCard: {
      background: `linear-gradient(135deg, rgba(0,0,0,0.6), rgba(20,20,20,0.8))`,
      borderRadius: "20px",
      padding: "1.5rem",
      border: `1px solid ${theme.primary}33`,
      marginBottom: "1.5rem"
    }
  };

  return (
    <div style={styles.container}>
      {/* Sidebar Toggle Button */}
      <button onClick={toggleSidebar} style={styles.toggleButton}
        onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
        onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}>
        {sidebarOpen ? "◀" : "▶"}
      </button>

      {/* Sidebar */}
      <div style={styles.sidebar}>
        {sidebarOpen && (
          <>
            <div style={{ padding: "1.5rem", borderBottom: `1px solid ${theme.primary}33`, textAlign: "center" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📊</div>
              <h3 style={{ color: theme.primary, fontSize: "1.1rem", fontWeight: 600 }}>Analytics Hub</h3>
              <p style={{ color: theme.text, opacity: 0.7, fontSize: "0.7rem" }}>Track & Analyze</p>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "1rem" }}>
              {Object.entries(groupedActions).map(([category, actions]) => (
                <div key={category} style={{ marginBottom: "1.5rem" }}>
                  <h4 style={{ color: theme.primary, fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", marginBottom: "0.75rem" }}>{category}</h4>
                  {actions.map((action, idx) => (
                    <div key={idx} onClick={() => {
                      if (!action.comingSoon && action.link !== "#") navigate(action.link);
                      else if (action.comingSoon) { setActiveQuickAction(action.title); setTimeout(() => setActiveQuickAction(null), 2000); }
                    }} style={{
                      display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem", marginBottom: "0.5rem",
                      borderRadius: "12px", background: activeQuickAction === action.title && action.comingSoon ? "rgba(255,193,7,0.2)" : "rgba(255,255,255,0.03)",
                      cursor: action.comingSoon ? "not-allowed" : "pointer", transition: "all 0.3s ease", opacity: action.comingSoon ? 0.6 : 1
                    }} onMouseEnter={(e) => { if (!action.comingSoon) e.currentTarget.style.background = `${theme.primary}1A`; }}
                      onMouseLeave={(e) => { if (!action.comingSoon) e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}>
                      <span style={{ fontSize: "1.2rem" }}>{action.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: "#fff", fontSize: "0.85rem", fontWeight: 500 }}>{action.title}</div>
                        <div style={{ color: theme.text, opacity: 0.7, fontSize: "0.7rem" }}>{action.description}</div>
                      </div>
                      {action.comingSoon && <span style={{ fontSize: "0.6rem", background: "rgba(255,193,7,0.2)", padding: "2px 6px", borderRadius: "4px", color: "#ffc107" }}>Soon</span>}
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div style={{ padding: "1rem", borderTop: `1px solid ${theme.primary}33`, textAlign: "center" }}>
              <button onClick={() => navigate("/dashboard")} style={{
                background: `${theme.primary}33`, border: `1px solid ${theme.primary}`, borderRadius: "8px",
                padding: "0.4rem 0.8rem", color: theme.primary, fontSize: "0.7rem", cursor: "pointer", width: "100%"
              }} onMouseEnter={(e) => e.currentTarget.style.background = `${theme.primary}4D`}
                onMouseLeave={(e) => e.currentTarget.style.background = `${theme.primary}33`}>
                ← Back to Dashboard
              </button>
            </div>
          </>
        )}
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, marginLeft: sidebarOpen ? "280px" : "0", transition: "margin-left 0.3s ease", padding: "2rem 1.5rem", width: "100%" }}>
        <div style={{ position: "fixed", top: "10%", right: "-5%", width: "400px", height: "400px", background: `radial-gradient(circle, ${theme.primary}14 0%, transparent 70%)`, borderRadius: "50%", filter: "blur(80px)", pointerEvents: "none" }}></div>
        
        <div style={{ maxWidth: "1400px", margin: "0 auto", position: "relative", zIndex: 2 }}>
          {/* Header */}
          <div style={{ marginBottom: "2rem" }}>
            <h1 style={{ fontSize: "2rem", fontWeight: 700, color: theme.text, marginBottom: "0.5rem" }}>📊 Analytics Dashboard</h1>
            <p style={{ color: `${theme.text}CC`, fontSize: "0.95rem" }}>Track your learning progress, engagement metrics, and content performance</p>
          </div>

          {/* Time Range Selector */}
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem", flexWrap: "wrap" }}>
            {["week", "month", "year", "all"].map((range) => (
              <button key={range} onClick={() => setTimeRange(range)} style={{
                padding: "0.5rem 1rem", borderRadius: "8px", border: `1px solid ${timeRange === range ? theme.primary : `${theme.primary}4D`}`,
                background: timeRange === range ? theme.gradient : "transparent", color: timeRange === range ? "white" : theme.primary,
                cursor: "pointer", transition: "all 0.3s ease"
              }} onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}>
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "4rem" }}>
              <div className="spinner" style={{ borderTopColor: theme.primary }}></div>
              <p style={{ color: theme.text, opacity: 0.7, marginTop: "1rem" }}>Loading analytics data...</p>
            </div>
          ) : (
            <>
              {/* Statistics Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
                <div style={styles.statCard(theme.primary)} onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-5px)"} onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}>
                  <div style={{ fontSize: "2rem" }}>📚</div>
                  <div style={{ color: theme.primary, fontSize: "1.8rem", fontWeight: 700 }}>{analyticsData.totalMaterials}</div>
                  <div style={{ color: theme.text, opacity: 0.7, fontSize: "0.85rem" }}>Total Materials</div>
                </div>
                <div style={styles.statCard("#4285F4")}>
                  <div style={{ fontSize: "2rem" }}>👤</div>
                  <div style={{ color: "#4285F4", fontSize: "1.8rem", fontWeight: 700 }}>{analyticsData.myMaterials}</div>
                  <div style={{ color: theme.text, opacity: 0.7, fontSize: "0.85rem" }}>My Materials</div>
                </div>
                <div style={styles.statCard("#28a745")}>
                  <div style={{ fontSize: "2rem" }}>👁️</div>
                  <div style={{ color: "#28a745", fontSize: "1.8rem", fontWeight: 700 }}>{analyticsData.totalViews}</div>
                  <div style={{ color: theme.text, opacity: 0.7, fontSize: "0.85rem" }}>Total Views</div>
                </div>
                <div style={styles.statCard("#17a2b8")}>
                  <div style={{ fontSize: "2rem" }}>⬇️</div>
                  <div style={{ color: "#17a2b8", fontSize: "1.8rem", fontWeight: 700 }}>{analyticsData.totalDownloads}</div>
                  <div style={{ color: theme.text, opacity: 0.7, fontSize: "0.85rem" }}>Downloads</div>
                </div>
              </div>

              {/* Chart Tabs */}
              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
                {["overview", "subjects", "activity", "engagement"].map((chart) => (
                  <button key={chart} onClick={() => setSelectedChart(chart)} style={{
                    padding: "0.5rem 1rem", borderRadius: "8px", border: `1px solid ${selectedChart === chart ? theme.primary : `${theme.primary}4D`}`,
                    background: selectedChart === chart ? theme.gradient : "transparent", color: selectedChart === chart ? "white" : theme.primary,
                    cursor: "pointer", transition: "all 0.3s ease"
                  }}>
                    {chart === "overview" && "📈 Overview"}
                    {chart === "subjects" && "📚 Subjects"}
                    {chart === "activity" && "⏰ Activity"}
                    {chart === "engagement" && "🎯 Engagement"}
                  </button>
                ))}
              </div>

              {/* Overview Chart - Monthly Uploads */}
              {selectedChart === "overview" && (
                <div style={styles.chartCard}>
                  <h3 style={{ color: theme.primary, fontSize: "1.2rem", fontWeight: 600, marginBottom: "1rem" }}>📈 Monthly Uploads & Views</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {analyticsData.monthlyUploads.map((data, idx) => (
                      <div key={idx}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                          <span style={{ color: theme.text, fontSize: "0.8rem" }}>{data.month}</span>
                          <span style={{ color: theme.primary, fontSize: "0.8rem" }}>{data.uploads} uploads</span>
                        </div>
                        <div style={{ width: "100%", height: "30px", background: "rgba(255,255,255,0.1)", borderRadius: "4px", overflow: "hidden", display: "flex" }}>
                          <div style={{ width: `${(data.uploads / maxUploads) * 100}%`, height: "100%", background: theme.gradient, transition: "width 0.5s ease", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", color: "white" }}>{data.uploads}</div>
                          <div style={{ width: `${(data.views / maxViews) * 100}%`, height: "100%", background: "#4285F4", transition: "width 0.5s ease", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", color: "white" }}>{data.views}</div>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.25rem" }}>
                          <span style={{ color: theme.text, opacity: 0.6, fontSize: "0.7rem" }}>📤 Uploads</span>
                          <span style={{ color: "#4285F4", opacity: 0.6, fontSize: "0.7rem" }}>👁️ Views</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Subjects Chart */}
              {selectedChart === "subjects" && (
                <div style={styles.chartCard}>
                  <h3 style={{ color: theme.primary, fontSize: "1.2rem", fontWeight: 600, marginBottom: "1rem" }}>📚 Materials by Subject</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {Object.entries(analyticsData.materialsBySubject).map(([subject, count], idx) => {
                      const total = analyticsData.totalMaterials;
                      const percentage = total > 0 ? (count / total) * 100 : 0;
                      return (
                        <div key={idx}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                            <span style={{ color: theme.text, fontSize: "0.85rem" }}>{subject}</span>
                            <span style={{ color: theme.primary, fontSize: "0.8rem" }}>{count} ({percentage.toFixed(1)}%)</span>
                          </div>
                          <div style={{ width: "100%", height: "25px", background: "rgba(255,255,255,0.1)", borderRadius: "4px", overflow: "hidden" }}>
                            <div style={{ width: `${percentage}%`, height: "100%", background: theme.gradient, transition: "width 0.5s ease", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", color: "white" }}>{percentage.toFixed(0)}%</div>
                          </div>
                        </div>
                      );
                    })}
                    {Object.keys(analyticsData.materialsBySubject).length === 0 && (
                      <p style={{ color: theme.text, opacity: 0.7, textAlign: "center", padding: "2rem" }}>No subject data available yet. Start uploading materials with subjects!</p>
                    )}
                  </div>
                </div>
              )}

              {/* Activity Chart - File Types */}
              {selectedChart === "activity" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
                  <div style={styles.chartCard}>
                    <h3 style={{ color: theme.primary, fontSize: "1.1rem", fontWeight: 600, marginBottom: "1rem" }}>📄 Materials by Type</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      {Object.entries(analyticsData.materialsByType).map(([type, count]) => (
                        <div key={type}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                            <span style={{ color: theme.text }}>{getTypeIcon(type)} {type}</span>
                            <span style={{ color: getTypeColor(type) }}>{count}</span>
                          </div>
                          <div style={{ width: "100%", height: "20px", background: "rgba(255,255,255,0.1)", borderRadius: "4px", overflow: "hidden" }}>
                            <div style={{ width: `${analyticsData.totalMaterials > 0 ? (count / analyticsData.totalMaterials) * 100 : 0}%`, height: "100%", background: getTypeColor(type), transition: "width 0.5s ease" }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={styles.chartCard}>
                    <h3 style={{ color: theme.primary, fontSize: "1.1rem", fontWeight: 600, marginBottom: "1rem" }}>⏰ Peak Usage Hours</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      {analyticsData.peakUsageHours.map((hour, idx) => (
                        <div key={idx}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                            <span style={{ color: theme.text, fontSize: "0.8rem" }}>{hour.hour}</span>
                            <span style={{ color: theme.primary, fontSize: "0.8rem" }}>{hour.activity}%</span>
                          </div>
                          <div style={{ width: "100%", height: "20px", background: "rgba(255,255,255,0.1)", borderRadius: "4px", overflow: "hidden" }}>
                            <div style={{ width: `${hour.activity}%`, height: "100%", background: theme.gradient, transition: "width 0.5s ease" }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Engagement Chart */}
              {selectedChart === "engagement" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem" }}>
                  <div style={styles.chartCard}>
                    <h3 style={{ color: theme.primary, fontSize: "1rem", fontWeight: 600, marginBottom: "0.5rem" }}>🎯 Engagement Rate</h3>
                    <div style={{ textAlign: "center", padding: "1rem" }}>
                      <div style={{ fontSize: "3rem", fontWeight: 700, color: theme.primary }}>{analyticsData.engagementRate}%</div>
                      <div style={{ width: "100%", height: "10px", background: "rgba(255,255,255,0.1)", borderRadius: "5px", marginTop: "1rem", overflow: "hidden" }}>
                        <div style={{ width: `${analyticsData.engagementRate}%`, height: "100%", background: theme.gradient, borderRadius: "5px" }}></div>
                      </div>
                      <p style={{ color: theme.text, opacity: 0.7, fontSize: "0.8rem", marginTop: "1rem" }}>Users engaging with your content</p>
                    </div>
                  </div>

                  <div style={styles.chartCard}>
                    <h3 style={{ color: theme.primary, fontSize: "1rem", fontWeight: 600, marginBottom: "0.5rem" }}>📅 Active Days</h3>
                    <div style={{ textAlign: "center", padding: "1rem" }}>
                      <div style={{ fontSize: "3rem", fontWeight: 700, color: "#28a745" }}>{analyticsData.activeDays}</div>
                      <div style={{ width: "100%", height: "10px", background: "rgba(255,255,255,0.1)", borderRadius: "5px", marginTop: "1rem", overflow: "hidden" }}>
                        <div style={{ width: `${(analyticsData.activeDays / 30) * 100}%`, height: "100%", background: "#28a745", borderRadius: "5px" }}></div>
                      </div>
                      <p style={{ color: theme.text, opacity: 0.7, fontSize: "0.8rem", marginTop: "1rem" }}>Days active in the last 30 days</p>
                    </div>
                  </div>

                  <div style={styles.chartCard}>
                    <h3 style={{ color: theme.primary, fontSize: "1rem", fontWeight: 600, marginBottom: "0.5rem" }}>✅ Completion Rate</h3>
                    <div style={{ textAlign: "center", padding: "1rem" }}>
                      <div style={{ fontSize: "3rem", fontWeight: 700, color: "#17a2b8" }}>{analyticsData.completionRate}%</div>
                      <div style={{ width: "100%", height: "10px", background: "rgba(255,255,255,0.1)", borderRadius: "5px", marginTop: "1rem", overflow: "hidden" }}>
                        <div style={{ width: `${analyticsData.completionRate}%`, height: "100%", background: "#17a2b8", borderRadius: "5px" }}></div>
                      </div>
                      <p style={{ color: theme.text, opacity: 0.7, fontSize: "0.8rem", marginTop: "1rem" }}>Study goals completion</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Top Materials Section */}
              <div style={styles.chartCard}>
                <h3 style={{ color: theme.primary, fontSize: "1.2rem", fontWeight: 600, marginBottom: "1rem" }}>🏆 Top Performing Materials</h3>
                {analyticsData.topMaterials.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {analyticsData.topMaterials.map((material, idx) => (
                      <div key={material.id} onClick={() => navigate(`/material/${material.id}`)} style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem",
                        background: "rgba(255,255,255,0.03)", borderRadius: "12px", cursor: "pointer", transition: "all 0.3s ease"
                      }} onMouseEnter={(e) => e.currentTarget.style.background = `${theme.primary}1A`}
                        onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}>
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                          <span style={{ fontSize: "1.2rem", fontWeight: 700, color: theme.primary }}>#{idx + 1}</span>
                          <div>
                            <div style={{ color: "#ffffff", fontWeight: 500 }}>{material.title}</div>
                            <div style={{ color: theme.primary, fontSize: "0.75rem" }}>{material.subject || "Uncategorized"}</div>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "1rem" }}>
                          <span style={{ color: "#28a745", fontSize: "0.8rem" }}>👁️ {material.views || 0}</span>
                          <span style={{ fontSize: "1rem" }}>{getTypeIcon(material.file_type)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: theme.text, opacity: 0.7, textAlign: "center", padding: "2rem" }}>No materials uploaded yet. Start uploading to see top performers!</p>
                )}
              </div>

              {/* Recent Activity Feed */}
              <div style={styles.chartCard}>
                <h3 style={{ color: theme.primary, fontSize: "1.2rem", fontWeight: 600, marginBottom: "1rem" }}>🔄 Recent Activity</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {analyticsData.recentActivity.map((activity, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.75rem", borderBottom: `1px solid ${theme.primary}1A` }}>
                      <span style={{ fontSize: "1.5rem" }}>{activity.action === "uploaded" ? "📤" : "👁️"}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: "#ffffff", fontSize: "0.9rem" }}>{activity.title}</div>
                        <div style={{ color: theme.text, opacity: 0.6, fontSize: "0.7rem" }}>{activity.action} • {formatDate(activity.date)}</div>
                      </div>
                      <span style={{ color: getTypeColor(activity.type), fontSize: "0.8rem" }}>{getTypeIcon(activity.type)} {activity.type}</span>
                    </div>
                  ))}
                  {analyticsData.recentActivity.length === 0 && (
                    <p style={{ color: theme.text, opacity: 0.7, textAlign: "center", padding: "2rem" }}>No recent activity. Upload your first material!</p>
                  )}
                </div>
              </div>

              {/* Storage Usage */}
              <div style={styles.chartCard}>
                <h3 style={{ color: theme.primary, fontSize: "1.2rem", fontWeight: 600, marginBottom: "1rem" }}>💾 Storage Usage</h3>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <span style={{ color: theme.text }}>Used Space</span>
                    <span style={{ color: theme.primary }}>{analyticsData.storageUsed} MB / {analyticsData.storageLimit} MB</span>
                  </div>
                  <div style={{ width: "100%", height: "30px", background: "rgba(255,255,255,0.1)", borderRadius: "8px", overflow: "hidden" }}>
                    <div style={{ width: `${(analyticsData.storageUsed / analyticsData.storageLimit) * 100}%`, height: "100%", background: theme.gradient, transition: "width 0.5s ease", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", color: "white" }}>
                      {((analyticsData.storageUsed / analyticsData.storageLimit) * 100).toFixed(1)}%
                    </div>
                  </div>
                  <p style={{ color: theme.text, opacity: 0.6, fontSize: "0.75rem", marginTop: "0.5rem" }}>
                    {analyticsData.storageLimit - analyticsData.storageUsed} MB remaining
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

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
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
        ::-webkit-scrollbar-thumb { background: ${theme.primary}; border-radius: 10px; }
      `}</style>
    </div>
  );
}

export default Analytics;