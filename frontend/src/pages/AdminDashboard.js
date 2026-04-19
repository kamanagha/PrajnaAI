import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import API from "../services/api";

function AdminDashboard() {
  const navigate = useNavigate();
  const { currentTheme, themes } = useTheme();
  const theme = themes[currentTheme];
  
  const [activeTab, setActiveTab] = useState("overview");
  const [users, setUsers] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    name: ""
  });
  const [popupMessage, setPopupMessage] = useState({ show: false, message: "", type: "" });

  // Get current user info safely
  const getCurrentUser = () => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr && userStr !== "undefined" && userStr !== "null") {
        return JSON.parse(userStr);
      }
    } catch (e) {
      console.error("Error parsing user:", e);
    }
    return { name: "Admin", username: "Admin" };
  };
  
  const currentUser = getCurrentUser();

  // Check if user is admin
  useEffect(() => {
    const isStaff = localStorage.getItem("is_staff") === "true";
    const isSuperuser = localStorage.getItem("is_superuser") === "true";
    
    if (!isStaff && !isSuperuser) {
      navigate("/dashboard");
      showPopup("Access denied. Admin privileges required.", "error");
    }
  }, [navigate]);

  useEffect(() => {
    fetchDashboardData();
    fetchMaterials();
  }, []);

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, logsRes] = await Promise.all([
        API.get("/admin/dashboard-stats/"),
        API.get("/admin/users/"),
        API.get("/admin/activity-logs/")
      ]);
      
      setStats(statsRes.data);
      setUsers(Array.isArray(statsRes.data?.recent_users) ? statsRes.data.recent_users : []);
      setLogs(Array.isArray(logsRes.data) ? logsRes.data : []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      showPopup("Failed to load dashboard data", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchMaterials = async () => {
    try {
      const res = await API.get("/admin/materials/");
      setMaterials(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error fetching materials:", error);
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      await API.post(`/admin/toggle-user-status/${userId}/`);
      showPopup(`User ${currentStatus ? "deactivated" : "activated"} successfully`, "success");
      fetchDashboardData();
    } catch (error) {
      showPopup("Failed to toggle user status", "error");
    }
  };

  const deleteUser = async (userId, username) => {
    if (window.confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
      try {
        await API.delete(`/admin/users/${userId}/`);
        showPopup(`User "${username}" deleted successfully`, "success");
        fetchDashboardData();
      } catch (error) {
        showPopup("Failed to delete user", "error");
      }
    }
  };

  const deleteMaterial = async (materialId, title) => {
    if (window.confirm(`Are you sure you want to delete material "${title}"?`)) {
      try {
        await API.delete(`/admin/delete-material/${materialId}/`);
        showPopup(`Material "${title}" deleted successfully`, "success");
        fetchMaterials();
        fetchDashboardData();
      } catch (error) {
        showPopup("Failed to delete material", "error");
      }
    }
  };

  const createUser = async () => {
    if (!newUser.username || !newUser.email || !newUser.password) {
      showPopup("Please fill in all required fields", "error");
      return;
    }
    
    try {
      await API.post("/admin/create-user/", newUser);
      showPopup("User created successfully", "success");
      setShowCreateUser(false);
      setNewUser({ username: "", email: "", password: "", first_name: "", last_name: "", name: "" });
      fetchDashboardData();
    } catch (error) {
      showPopup(error.response?.data?.username?.[0] || "Failed to create user", "error");
    }
  };

  // Safely filter users
  const getFilteredUsers = () => {
    if (!Array.isArray(users)) return [];
    
    return users.filter(user => {
      const username = user?.username || "";
      const email = user?.email || "";
      const matchesSearch = username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" ? true :
                           statusFilter === "active" ? user?.is_active === true :
                           statusFilter === "inactive" ? user?.is_active === false :
                           statusFilter === "admin" ? user?.is_staff === true : true;
      return matchesSearch && matchesStatus;
    });
  };

  const filteredUsers = getFilteredUsers();

  const styles = {
    container: {
      minHeight: "calc(100vh - 80px)",
      background: `linear-gradient(135deg, ${theme.background} 0%, ${theme.surface} 50%, ${theme.background} 100%)`,
      padding: "2rem 1.5rem",
      fontFamily: "'Poppins', 'Segoe UI', 'Montserrat', system-ui, sans-serif",
      transition: "all 0.3s ease"
    },
    card: {
      background: "linear-gradient(135deg, rgba(0,0,0,0.6), rgba(20,20,20,0.8))",
      borderRadius: "20px",
      padding: "1.5rem",
      border: `1px solid ${theme.primary}33`,
      transition: "all 0.3s ease"
    },
    statCard: {
      background: "linear-gradient(135deg, rgba(0,0,0,0.6), rgba(20,20,20,0.8))",
      borderRadius: "16px",
      padding: "1.2rem",
      textAlign: "center",
      border: `1px solid ${theme.primary}33`,
      transition: "transform 0.3s ease"
    },
    tabButton: (isActive) => ({
      padding: "0.75rem 1.5rem",
      background: isActive ? theme.gradient : "rgba(255, 255, 255, 0.05)",
      border: isActive ? "none" : `1px solid ${theme.primary}4D`,
      borderRadius: "12px",
      color: isActive ? "white" : theme.primary,
      cursor: "pointer",
      fontWeight: 600,
      transition: "all 0.3s ease"
    }),
    input: {
      width: "100%",
      padding: "0.8rem 1rem",
      marginBottom: "1rem",
      background: "rgba(255, 255, 255, 0.05)",
      border: `1px solid ${theme.primary}4D`,
      borderRadius: "12px",
      color: "#ffffff",
      fontSize: "0.9rem",
      transition: "all 0.3s ease",
      outline: "none"
    },
    uploadButton: {
      padding: "0.8rem 1.5rem",
      background: theme.gradient,
      border: "none",
      borderRadius: "12px",
      color: "white",
      fontWeight: 600,
      cursor: "pointer",
      transition: "all 0.3s ease"
    },
    clearButton: {
      padding: "0.8rem 1.5rem",
      background: "rgba(108, 117, 125, 0.2)",
      border: `1px solid ${theme.primary}4D`,
      borderRadius: "12px",
      color: theme.text,
      cursor: "pointer",
      transition: "all 0.3s ease"
    },
    table: {
      width: "100%",
      overflowX: "auto",
      display: "block"
    },
    th: {
      textAlign: "left",
      padding: "1rem",
      color: theme.primary,
      borderBottom: `1px solid ${theme.primary}33`
    },
    td: {
      padding: "1rem",
      color: theme.text,
      borderBottom: `1px solid ${theme.primary}1A`
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: "center", padding: "4rem" }}>
          <div className="spinner"></div>
          <p style={{ color: theme.primary, marginTop: "1rem" }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Popup Notification */}
      {popupMessage.show && (
        <div style={{
          position: "fixed",
          top: "90px",
          right: "20px",
          zIndex: 99999,
          animation: "slideInRight 0.5s ease-out, fadeOut 0.5s ease-out 2.5s forwards"
        }}>
          <div style={{
            background: popupMessage.type === "success" 
              ? "linear-gradient(135deg, #28a745, #20c997)"
              : "linear-gradient(135deg, #dc3545, #c82333)",
            color: "white",
            padding: "1rem 1.5rem",
            borderRadius: "12px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            minWidth: "320px"
          }}>
            <span style={{ fontSize: "1.5rem" }}>{popupMessage.type === "success" ? "✅" : "⚠️"}</span>
            <span>{popupMessage.message}</span>
            <button onClick={() => setPopupMessage({ show: false, message: "", type: "" })} style={{ background: "none", border: "none", color: "white", cursor: "pointer", marginLeft: "auto", fontSize: "1.2rem" }}>✕</button>
          </div>
        </div>
      )}

      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 800, background: theme.gradient, backgroundClip: "text", WebkitBackgroundClip: "text", color: "transparent" }}>
            Admin Dashboard
          </h1>
          <p style={{ color: `${theme.text}CC` }}>
            Welcome back, <strong>{currentUser.name || currentUser.username}</strong>! Manage users, materials, and monitor system activity
          </p>
        </div>

        {/* Stats Cards */}
        {stats && stats.users && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
            <div style={styles.statCard} onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-5px)"} onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}>
              <div style={{ fontSize: "2rem" }}>👥</div>
              <div style={{ color: theme.primary, fontSize: "1.8rem", fontWeight: 700 }}>{stats.users.total || 0}</div>
              <div style={{ color: `${theme.text}99`, fontSize: "0.85rem" }}>Total Users</div>
            </div>
            <div style={styles.statCard} onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-5px)"} onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}>
              <div style={{ fontSize: "2rem" }}>🟢</div>
              <div style={{ color: "#28a745", fontSize: "1.8rem", fontWeight: 700 }}>{stats.users.active || 0}</div>
              <div style={{ color: `${theme.text}99`, fontSize: "0.85rem" }}>Active Users</div>
            </div>
            <div style={styles.statCard} onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-5px)"} onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}>
              <div style={{ fontSize: "2rem" }}>📚</div>
              <div style={{ color: theme.primary, fontSize: "1.8rem", fontWeight: 700 }}>{stats.materials?.total || 0}</div>
              <div style={{ color: `${theme.text}99`, fontSize: "0.85rem" }}>Total Materials</div>
            </div>
            <div style={styles.statCard} onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-5px)"} onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}>
              <div style={{ fontSize: "2rem" }}>📈</div>
              <div style={{ color: "#17a2b8", fontSize: "1.8rem", fontWeight: 700 }}>{stats.users.new_today || 0}</div>
              <div style={{ color: `${theme.text}99`, fontSize: "0.85rem" }}>New Today</div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
          <button onClick={() => setActiveTab("overview")} style={styles.tabButton(activeTab === "overview")}>📊 Overview</button>
          <button onClick={() => { setActiveTab("users"); fetchDashboardData(); }} style={styles.tabButton(activeTab === "users")}>👥 Users</button>
          <button onClick={() => { setActiveTab("materials"); fetchMaterials(); }} style={styles.tabButton(activeTab === "materials")}>📚 Materials</button>
          <button onClick={() => setActiveTab("logs")} style={styles.tabButton(activeTab === "logs")}>📝 Activity Logs</button>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && stats && (
          <div>
            {/* Popular Subjects */}
            <div style={{ ...styles.card, marginBottom: "1.5rem" }}>
              <h3 style={{ color: theme.primary, marginBottom: "1rem" }}>Popular Subjects</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {stats.popular_subjects && stats.popular_subjects.length > 0 ? (
                  stats.popular_subjects.map((subjectItem, index) => (
                    <div key={index}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                        <span style={{ color: theme.text }}>{subjectItem.subject || "Uncategorized"}</span>
                        <span style={{ color: theme.primary }}>{subjectItem.count} materials</span>
                      </div>
                      <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "3px", overflow: "hidden" }}>
                        <div style={{ width: `${(subjectItem.count / (stats.materials?.total || 1)) * 100}%`, height: "100%", background: theme.gradient, borderRadius: "3px" }}></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ color: theme.text, opacity: 0.7 }}>No subjects data available</p>
                )}
              </div>
            </div>

            {/* Recent Users */}
            <div style={{ ...styles.card, marginBottom: "1.5rem" }}>
              <h3 style={{ color: theme.primary, marginBottom: "1rem" }}>Recent Users</h3>
              <div style={styles.table}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Username</th>
                      <th style={styles.th}>Email</th>
                      <th style={styles.th}>Joined</th>
                      <th style={styles.th}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recent_users && stats.recent_users.length > 0 ? (
                      stats.recent_users.slice(0, 5).map((userItem) => (
                        <tr key={userItem.id}>
                          <td style={styles.td}>{userItem.username || "-"}</td>
                          <td style={styles.td}>{userItem.email || "-"}</td>
                          <td style={styles.td}>{userItem.date_joined ? new Date(userItem.date_joined).toLocaleDateString() : "-"}</td>
                          <td style={styles.td}>
                            <span style={{ color: userItem.is_active ? "#28a745" : "#dc3545" }}>
                              {userItem.is_active ? "Active" : "Inactive"}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" style={{ textAlign: "center", padding: "2rem", color: theme.text, opacity: 0.7 }}>No users found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Materials */}
            <div style={styles.card}>
              <h3 style={{ color: theme.primary, marginBottom: "1rem" }}>Recent Uploads</h3>
              <div style={styles.table}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Title</th>
                      <th style={styles.th}>Subject</th>
                      <th style={styles.th}>Uploaded By</th>
                      <th style={styles.th}>Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recent_materials && stats.recent_materials.length > 0 ? (
                      stats.recent_materials.slice(0, 5).map((materialItem, idx) => (
                        <tr key={materialItem.id || idx}>
                          <td style={styles.td}>{materialItem.title || "-"}</td>
                          <td style={styles.td}>{materialItem.subject || "-"}</td>
                          <td style={styles.td}>{materialItem.username || "Unknown"}</td>
                          <td style={styles.td}>{materialItem.file_type || "-"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" style={{ textAlign: "center", padding: "2rem", color: theme.text, opacity: 0.7 }}>No materials found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div style={styles.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
              <h3 style={{ color: theme.primary, margin: 0 }}>User Management</h3>
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={styles.input}
                />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={styles.input}
                >
                  <option value="all">All Users</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                  <option value="admin">Admins</option>
                </select>
                <button onClick={() => setShowCreateUser(true)} style={styles.uploadButton}>
                  + Create User
                </button>
              </div>
            </div>

            <div style={styles.table}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>Username</th>
                    <th style={styles.th}>Email</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Joined</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((userItem) => (
                      <tr key={userItem.id}>
                        <td style={styles.td}>{userItem.id}</td>
                        <td style={styles.td}>
                          {userItem.username || "-"}
                          {userItem.is_staff && <span style={{ color: theme.primary, marginLeft: "0.5rem" }}>(Admin)</span>}
                        </td>
                        <td style={styles.td}>{userItem.email || "-"}</td>
                        <td style={styles.td}>
                          <span style={{ color: userItem.is_active ? "#28a745" : "#dc3545" }}>
                            {userItem.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td style={styles.td}>{userItem.date_joined ? new Date(userItem.date_joined).toLocaleDateString() : "-"}</td>
                        <td style={styles.td}>
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button
                              onClick={() => toggleUserStatus(userItem.id, userItem.is_active)}
                              style={{
                                padding: "0.25rem 0.75rem",
                                background: userItem.is_active ? "rgba(220, 53, 69, 0.2)" : "rgba(40, 167, 69, 0.2)",
                                border: `1px solid ${userItem.is_active ? "#dc3545" : "#28a745"}`,
                                borderRadius: "6px",
                                color: userItem.is_active ? "#dc3545" : "#28a745",
                                cursor: "pointer"
                              }}
                            >
                              {userItem.is_active ? "Deactivate" : "Activate"}
                            </button>
                            {!userItem.is_staff && (
                              <button
                                onClick={() => deleteUser(userItem.id, userItem.username)}
                                style={{
                                  padding: "0.25rem 0.75rem",
                                  background: "rgba(220, 53, 69, 0.2)",
                                  border: "1px solid #dc3545",
                                  borderRadius: "6px",
                                  color: "#dc3545",
                                  cursor: "pointer"
                                }}
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: "center", padding: "2rem", color: theme.text, opacity: 0.7 }}>No users found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Materials Tab */}
        {activeTab === "materials" && (
          <div style={styles.card}>
            <h3 style={{ color: theme.primary, marginBottom: "1rem" }}>Material Management</h3>
            <div style={styles.table}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>Title</th>
                    <th style={styles.th}>Subject</th>
                    <th style={styles.th}>Uploaded By</th>
                    <th style={styles.th}>Type</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {materials.length > 0 ? (
                    materials.map((materialItem) => (
                      <tr key={materialItem.id}>
                        <td style={styles.td}>{materialItem.id}</td>
                        <td style={styles.td}>{materialItem.title || "-"}</td>
                        <td style={styles.td}>{materialItem.subject || "-"}</td>
                        <td style={styles.td}>{materialItem.username || "Unknown"}</td>
                        <td style={styles.td}>{materialItem.file_type || "-"}</td>
                        <td style={styles.td}>
                          <button
                            onClick={() => deleteMaterial(materialItem.id, materialItem.title)}
                            style={{
                              padding: "0.25rem 0.75rem",
                              background: "rgba(220, 53, 69, 0.2)",
                              border: "1px solid #dc3545",
                              borderRadius: "6px",
                              color: "#dc3545",
                              cursor: "pointer"
                            }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: "center", padding: "2rem", color: theme.text, opacity: 0.7 }}>No materials found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === "logs" && (
          <div style={styles.card}>
            <h3 style={{ color: theme.primary, marginBottom: "1rem" }}>Activity Logs</h3>
            <div style={styles.table}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={styles.th}>Admin</th>
                    <th style={styles.th}>Action</th>
                    <th style={styles.th}>Description</th>
                    <th style={styles.th}>Target</th>
                    <th style={styles.th}>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length > 0 ? (
                    logs.map((logItem) => (
                      <tr key={logItem.id}>
                        <td style={styles.td}>{logItem.admin_name || "-"}</td>
                        <td style={styles.td}>
                          <span style={{
                            padding: "0.2rem 0.5rem",
                            borderRadius: "4px",
                            background: logItem.action_type?.includes("DELETE") ? "rgba(220,53,69,0.2)" : "rgba(40,167,69,0.2)",
                            color: logItem.action_type?.includes("DELETE") ? "#dc3545" : "#28a745",
                            fontSize: "0.75rem"
                          }}>
                            {logItem.action_type || "-"}
                          </span>
                        </td>
                        <td style={styles.td}>{logItem.description || "-"}</td>
                        <td style={styles.td}>{logItem.target_name || "-"}</td>
                        <td style={styles.td}>{logItem.timestamp ? new Date(logItem.timestamp).toLocaleString() : "-"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: "center", padding: "2rem", color: theme.text, opacity: 0.7 }}>No activity logs found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateUser && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.9)",
          backdropFilter: "blur(8px)",
          zIndex: 100000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <div style={{
            background: theme.surface,
            borderRadius: "20px",
            padding: "2rem",
            maxWidth: "500px",
            width: "90%",
            border: `1px solid ${theme.primary}`
          }}>
            <h2 style={{ color: theme.primary, marginBottom: "1rem" }}>Create New User</h2>
            <input
              type="text"
              placeholder="Username *"
              value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              style={styles.input}
            />
            <input
              type="email"
              placeholder="Email *"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              style={styles.input}
            />
            <input
              type="password"
              placeholder="Password *"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Full Name"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              style={styles.input}
            />
            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
              <button onClick={createUser} style={{ flex: 1, ...styles.uploadButton }}>Create</button>
              <button onClick={() => setShowCreateUser(false)} style={{ flex: 1, ...styles.clearButton }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(100px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeOut {
          to { opacity: 0; visibility: hidden; }
        }
        .spinner {
          display: inline-block;
          width: 40px;
          height: 40px;
          border: 3px solid ${theme.primary}4D;
          border-top: 3px solid ${theme.primary};
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default AdminDashboard;