import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

function ViewMaterials() {
  const navigate = useNavigate();
  const { currentTheme, themes } = useTheme();
  const theme = themes[currentTheme];
  
  const [materials, setMaterials] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [subjects, setSubjects] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [popupMessage, setPopupMessage] = useState({ show: false, message: "", type: "" });

  const currentUser = localStorage.getItem("user_id") || localStorage.getItem("user");
  const currentUserName = localStorage.getItem("name") || "User";

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
    // Auto scroll to top to ensure popup is visible
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const res = await API.get("/materials/view/");
      setMaterials(res.data);
      setFiltered(res.data);
      
      // Extract unique subjects
      const uniqueSubjects = [...new Set(res.data.map(m => m.subject).filter(Boolean))];
      setSubjects(uniqueSubjects);
      setError("");
    } catch (err) {
      setError("Failed to load materials. Please try again.");
      showPopup("Failed to load materials. Please try again.", "error");
      console.error("Error fetching materials:", err);
    } finally {
      setLoading(false);
    }
  };

  // Get file type
  const getType = (m) => {
    return m.file_type || "NOTE";
  };

  // Get file icon based on type
  const getFileIcon = (type) => {
    switch(type) {
      case "PDF": return "📄";
      case "DOC": return "📝";
      case "PPT": return "📊";
      case "EXCEL": return "📈";
      case "IMAGE": return "🖼️";
      default: return "📘";
    }
  };

  // Get color based on file type
  const getTypeColor = (type) => {
    switch(type) {
      case "PDF": return "#FF4444";
      case "DOC": return "#4285F4";
      case "PPT": return "#FF9800";
      case "EXCEL": return "#4CAF50";
      case "IMAGE": return "#9C27B0";
      default: return theme.primary;
    }
  };

  // Delete function with confirmation
  const deleteMaterial = async (id, ownerId) => {
    setShowDeleteConfirm(null);
    
    if (String(ownerId) !== String(currentUser)) {
      showPopup("❌ You can only delete your own files!", "error");
      return;
    }

    try {
      await API.delete(`/materials/delete/${id}/`, {
        data: { user_id: currentUser }
      });

      showPopup("✅ Material deleted successfully!", "success");
      
      // Update UI
      const updatedMaterials = materials.filter(m => m.id !== id);
      setMaterials(updatedMaterials);
      setFiltered(updatedMaterials);
      
      // Update subjects list
      const uniqueSubjects = [...new Set(updatedMaterials.map(m => m.subject).filter(Boolean))];
      setSubjects(uniqueSubjects);

    } catch (err) {
      showPopup("❌ Delete failed. Please try again.", "error");
      console.error(err);
    }
  };

  // Filter and sort logic
  useEffect(() => {
    let data = [...materials];

    // Search filter
    if (search) {
      data = data.filter(m =>
        m.title?.toLowerCase().includes(search.toLowerCase()) ||
        m.subject?.toLowerCase().includes(search.toLowerCase()) ||
        m.description?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Type filter
    if (type !== "all") {
      data = data.filter(m => getType(m).toLowerCase() === type);
    }

    // Subject filter
    if (selectedSubject !== "all") {
      data = data.filter(m => m.subject === selectedSubject);
    }

    // Sorting
    if (sortBy === "newest") {
      data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sortBy === "oldest") {
      data.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    } else if (sortBy === "title-asc") {
      data.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    } else if (sortBy === "title-desc") {
      data.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
    }

    setFiltered(data);
  }, [search, type, materials, sortBy, selectedSubject]);

  // Clear all filters
  const clearFilters = () => {
    setSearch("");
    setType("all");
    setSelectedSubject("all");
    setSortBy("newest");
    showPopup("All filters cleared!", "success");
  };

  // Get statistics
  const getStatistics = () => {
    const total = materials.length;
    const myMaterials = materials.filter(m => String(m.user_id) === String(currentUser)).length;
    const pdfs = materials.filter(m => getType(m) === "PDF").length;
    const docs = materials.filter(m => getType(m) === "DOC").length;
    const notes = materials.filter(m => getType(m) === "NOTE").length;
    return { total, myMaterials, pdfs, docs, notes };
  };

  const stats = getStatistics();

  // Dynamic styles based on theme
  const styles = {
    container: {
      minHeight: "calc(100vh - 80px)",
      background: `linear-gradient(135deg, ${theme.background} 0%, ${theme.surface} 50%, ${theme.background} 100%)`,
      padding: "2rem 1.5rem",
      fontFamily: "'Poppins', 'Segoe UI', 'Montserrat', system-ui, sans-serif",
      position: "relative",
      transition: "all 0.3s ease"
    },
    gradientText: {
      background: theme.gradient,
      backgroundClip: "text",
      WebkitBackgroundClip: "text",
      color: "transparent"
    },
    statCard: (borderColor) => ({
      background: "linear-gradient(135deg, rgba(0,0,0,0.6), rgba(20,20,20,0.8))",
      borderRadius: "16px",
      padding: "1rem",
      textAlign: "center",
      border: `1px solid ${borderColor}`,
      transition: "transform 0.3s ease"
    }),
    filtersContainer: {
      background: "rgba(0, 0, 0, 0.7)",
      backdropFilter: "blur(10px)",
      borderRadius: "20px",
      padding: "1.5rem",
      marginBottom: "2rem",
      border: `2px solid ${theme.primary}`,
      transition: "all 0.3s ease",
      boxShadow: `0 5px 20px ${theme.primary}1A`
    },
    label: {
      display: "block",
      color: theme.primary,
      marginBottom: "0.5rem",
      fontSize: "0.85rem",
      fontWeight: 600,
      letterSpacing: "0.5px"
    },
    input: {
      width: "100%",
      padding: "0.8rem 1rem",
      background: "rgba(255, 255, 255, 0.1)",
      border: `2px solid ${theme.primary}4D`,
      borderRadius: "12px",
      color: "#ffffff",
      fontSize: "0.9rem",
      transition: "all 0.3s ease",
      outline: "none"
    },
    select: {
      width: "100%",
      padding: "0.8rem 1rem",
      background: "rgba(255, 255, 255, 0.1)",
      border: `2px solid ${theme.primary}4D`,
      borderRadius: "12px",
      color: "#ffffff",
      fontSize: "0.9rem",
      cursor: "pointer",
      outline: "none"
    },
    viewButton: (isActive) => ({
      flex: 1,
      padding: "0.8rem",
      background: isActive ? theme.gradient : "rgba(255, 255, 255, 0.1)",
      border: isActive ? "none" : `2px solid ${theme.primary}4D`,
      borderRadius: "12px",
      color: isActive ? "white" : theme.primary,
      cursor: "pointer",
      transition: "all 0.3s ease",
      fontWeight: 600
    }),
    materialCard: {
      cursor: "pointer",
      background: "linear-gradient(135deg, rgba(0,0,0,0.6), rgba(20,20,20,0.8))",
      borderRadius: "16px",
      border: `1px solid ${theme.primary}33`,
      transition: "all 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1)",
      position: "relative"
    },
    uploadButton: {
      padding: "0.8rem 1.5rem",
      background: theme.gradient,
      border: "none",
      borderRadius: "12px",
      color: "white",
      fontWeight: 600,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      transition: "all 0.3s ease"
    },
    deleteButton: {
      position: "absolute",
      top: "10px",
      right: "10px",
      background: "rgba(220, 53, 69, 0.95)",
      border: "none",
      borderRadius: "8px",
      padding: "5px 12px",
      color: "white",
      cursor: "pointer",
      fontSize: "0.75rem",
      transition: "all 0.3s ease",
      zIndex: 10,
      fontWeight: 600
    },
    ownerBadge: {
      position: "absolute",
      top: "10px",
      left: "10px",
      background: `${theme.primary}CC`,
      border: `1px solid ${theme.primary}`,
      borderRadius: "6px",
      padding: "3px 10px",
      fontSize: "0.7rem",
      color: "white",
      zIndex: 10,
      fontWeight: 600
    }
  };

  return (
    <div style={styles.container}>
      {/* Popup Notification - Fixed position above navbar */}
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
            minWidth: "320px",
            maxWidth: "450px",
            border: "1px solid rgba(255,255,255,0.2)"
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
                fontSize: "1.2rem",
                padding: "0 5px"
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
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
          justifyContent: "center",
          animation: "fadeIn 0.3s ease-out"
        }}>
          <div style={{
            background: `linear-gradient(135deg, ${theme.surface}, ${theme.background})`,
            borderRadius: "20px",
            padding: "2rem",
            maxWidth: "400px",
            textAlign: "center",
            border: `2px solid ${theme.primary}`,
            boxShadow: `0 10px 40px ${theme.primary}33`
          }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
            <h3 style={{ color: "#FF4444", marginBottom: "1rem", fontSize: "1.5rem" }}>Confirm Delete</h3>
            <p style={{ color: theme.text, opacity: 0.8, marginBottom: "1.5rem", lineHeight: 1.6 }}>
              Are you sure you want to delete this material? This action cannot be undone.
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                style={{
                  padding: "0.7rem 1.5rem",
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  borderRadius: "10px",
                  color: "#ffffff",
                  cursor: "pointer",
                  fontWeight: 600,
                  transition: "all 0.3s ease"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMaterial(showDeleteConfirm.id, showDeleteConfirm.ownerId)}
                style={{
                  padding: "0.7rem 1.5rem",
                  background: "linear-gradient(135deg, #dc3545, #c82333)",
                  border: "none",
                  borderRadius: "10px",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: 600,
                  transition: "all 0.3s ease"
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decorative background */}
      <div style={{
        position: "fixed",
        top: "20%",
        right: "-10%",
        width: "500px",
        height: "500px",
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
        {/* Header with User Info */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
          flexWrap: "wrap",
          gap: "1rem"
        }}>
          <div>
            <h1 style={{
              fontSize: "2.5rem",
              fontWeight: 800,
              ...styles.gradientText,
              marginBottom: "0.5rem"
            }}>
              📚 My Study Materials
            </h1>
            <p style={{ color: theme.text, opacity: 0.8, fontSize: "1rem" }}>
              Welcome back, <span style={{ color: theme.primary, fontWeight: 600 }}>{currentUserName}</span>! 
              Manage and access your learning resources
            </p>
          </div>
          
          {/* Add Material Button */}
          <button
            onClick={() => navigate("/upload")}
            style={styles.uploadButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = `0 5px 15px ${theme.primary}4D`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            ➕ Upload New Material
          </button>
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
          >
            <div style={{ fontSize: "2rem" }}>📚</div>
            <div style={{ color: theme.primary, fontSize: "1.5rem", fontWeight: 700 }}>{stats.total}</div>
            <div style={{ color: theme.text, opacity: 0.7, fontSize: "0.85rem" }}>Total Materials</div>
          </div>
          <div
            style={styles.statCard("rgba(66, 133, 244, 0.2)")}
            onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
          >
            <div style={{ fontSize: "2rem" }}>👤</div>
            <div style={{ color: "#4285F4", fontSize: "1.5rem", fontWeight: 700 }}>{stats.myMaterials}</div>
            <div style={{ color: theme.text, opacity: 0.7, fontSize: "0.85rem" }}>My Materials</div>
          </div>
          <div
            style={styles.statCard("rgba(255, 68, 68, 0.2)")}
            onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
          >
            <div style={{ fontSize: "2rem" }}>📄</div>
            <div style={{ color: "#FF4444", fontSize: "1.5rem", fontWeight: 700 }}>{stats.pdfs}</div>
            <div style={{ color: theme.text, opacity: 0.7, fontSize: "0.85rem" }}>PDF Files</div>
          </div>
          <div
            style={styles.statCard("rgba(156, 39, 176, 0.2)")}
            onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
          >
            <div style={{ fontSize: "2rem" }}>📘</div>
            <div style={{ color: "#9C27B0", fontSize: "1.5rem", fontWeight: 700 }}>{stats.notes}</div>
            <div style={{ color: theme.text, opacity: 0.7, fontSize: "0.85rem" }}>Notes</div>
          </div>
        </div>

        {/* Filters Section - Enhanced Visibility */}
        <div style={styles.filtersContainer}>
          <div style={{
            marginBottom: "1rem",
            paddingBottom: "0.5rem",
            borderBottom: `2px solid ${theme.primary}`,
            display: "inline-block"
          }}>
            <h3 style={{
              color: theme.primary,
              fontSize: "1.1rem",
              fontWeight: 700,
              margin: 0
            }}>
              🔍 Filter & Sort Materials
            </h3>
          </div>
          
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1.2rem",
            alignItems: "end"
          }}>
            {/* Search Input */}
            <div>
              <label style={styles.label}>
                🔍 Search Materials
              </label>
              <input
                type="text"
                placeholder="Search by title, subject..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={styles.input}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = theme.primary;
                  e.currentTarget.style.boxShadow = `0 0 0 3px ${theme.primary}1A`;
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = `${theme.primary}4D`;
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                }}
              />
            </div>

            {/* File Type Filter */}
            <div>
              <label style={styles.label}>
                📂 File Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                style={styles.select}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = theme.primary;
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = `${theme.primary}4D`;
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                }}
              >
                <option value="all" style={{ background: theme.surface }}>All Types</option>
                <option value="pdf" style={{ background: theme.surface }}>📄 PDF</option>
                <option value="doc" style={{ background: theme.surface }}>📝 DOC</option>
                <option value="note" style={{ background: theme.surface }}>📘 Notes</option>
              </select>
            </div>

            {/* Subject Filter */}
            {subjects.length > 0 && (
              <div>
                <label style={styles.label}>
                  📚 Subject
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  style={styles.select}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = theme.primary;
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = `${theme.primary}4D`;
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                  }}
                >
                  <option value="all" style={{ background: theme.surface }}>All Subjects</option>
                  {subjects.map(subject => (
                    <option key={subject} value={subject} style={{ background: theme.surface }}>{subject}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Sort By */}
            <div>
              <label style={styles.label}>
                🔄 Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={styles.select}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = theme.primary;
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = `${theme.primary}4D`;
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                }}
              >
                <option value="newest" style={{ background: theme.surface }}>🆕 Newest First</option>
                <option value="oldest" style={{ background: theme.surface }}>📅 Oldest First</option>
                <option value="title-asc" style={{ background: theme.surface }}>🔤 Title (A-Z)</option>
                <option value="title-desc" style={{ background: theme.surface }}>🔤 Title (Z-A)</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div>
              <label style={styles.label}>
                👁️ View Mode
              </label>
              <div style={{
                display: "flex",
                gap: "0.5rem"
              }}>
                <button
                  onClick={() => setViewMode("grid")}
                  style={styles.viewButton(viewMode === "grid")}
                >
                  📱 Grid View
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  style={styles.viewButton(viewMode === "list")}
                >
                  📋 List View
                </button>
              </div>
            </div>
          </div>

          {/* Clear Filters Button */}
          {(search || type !== "all" || selectedSubject !== "all" || sortBy !== "newest") && (
            <button
              onClick={clearFilters}
              style={{
                marginTop: "1.5rem",
                padding: "0.6rem 1.2rem",
                background: `${theme.primary}33`,
                border: `2px solid ${theme.primary}`,
                borderRadius: "10px",
                color: theme.primary,
                cursor: "pointer",
                fontSize: "0.85rem",
                transition: "all 0.3s ease",
                fontWeight: 600,
                width: "auto",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `${theme.primary}4D`;
                e.currentTarget.style.transform = "scale(1.02)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = `${theme.primary}33`;
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              🗑️ Clear All Filters
            </button>
          )}
        </div>

        {/* Results Count */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          gap: "1rem"
        }}>
          <p style={{ color: theme.text, opacity: 0.7, fontSize: "0.9rem" }}>
            Showing <span style={{ color: theme.primary, fontWeight: 600 }}>{filtered.length}</span> of{" "}
            <span style={{ color: theme.primary, fontWeight: 600 }}>{materials.length}</span> materials
          </p>
          {filtered.length === 0 && materials.length > 0 && (
            <p style={{ color: theme.primary, fontSize: "0.9rem", fontWeight: 500 }}>
              No results found. Try adjusting your filters.
            </p>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "4rem"
          }}>
            <div className="spinner" style={{ borderTopColor: theme.primary }}></div>
            <p style={{ color: theme.primary, marginLeft: "1rem" }}>Loading materials...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div style={{
            background: "rgba(220, 53, 69, 0.1)",
            border: "2px solid rgba(220, 53, 69, 0.3)",
            borderRadius: "12px",
            padding: "1rem",
            textAlign: "center",
            color: "#ff6b6b"
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Materials Grid/List View */}
        {!loading && !error && (
          <div style={{
            display: viewMode === "grid" ? "grid" : "flex",
            gridTemplateColumns: viewMode === "grid" ? "repeat(auto-fill, minmax(320px, 1fr))" : "none",
            flexDirection: viewMode === "list" ? "column" : "none",
            gap: "1.5rem"
          }}>
            {filtered.map((m) => (
              <div
                key={m.id}
                onClick={() => navigate(`/material/${m.id}`)}
                style={{
                  ...styles.materialCard,
                  padding: viewMode === "grid" ? "1.5rem" : "1rem",
                  display: viewMode === "list" ? "flex" : "block",
                  alignItems: viewMode === "list" ? "center" : "stretch",
                  gap: viewMode === "list" ? "1rem" : "0"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.borderColor = `${theme.primary}80`;
                  e.currentTarget.style.boxShadow = `0 10px 30px ${theme.primary}33`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = `${theme.primary}33`;
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {/* Delete Button (Only for owner) */}
                {String(m.user_id) === String(currentUser) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteConfirm({ id: m.id, ownerId: m.user_id });
                    }}
                    style={styles.deleteButton}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#dc3545";
                      e.currentTarget.style.transform = "scale(1.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(220, 53, 69, 0.95)";
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  >
                    🗑️ Delete
                  </button>
                )}

                {/* Owner Badge */}
                {String(m.user_id) === String(currentUser) && (
                  <div style={styles.ownerBadge}>
                    ⭐ My Material
                  </div>
                )}

                {/* File Icon */}
                <div style={{
                  textAlign: viewMode === "grid" ? "center" : "left",
                  fontSize: viewMode === "grid" ? "3rem" : "2rem",
                  marginBottom: viewMode === "grid" ? "1rem" : "0"
                }}>
                  {getFileIcon(getType(m))}
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <h5 style={{
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    color: "#ffffff",
                    marginBottom: "0.5rem",
                    wordBreak: "break-word",
                    paddingRight: viewMode === "grid" ? "0" : "80px"
                  }}>
                    {m.title}
                  </h5>
                  
                  {m.subject && (
                    <p style={{
                      color: theme.primary,
                      fontSize: "0.85rem",
                      marginBottom: "0.5rem"
                    }}>
                      📖 {m.subject}
                    </p>
                  )}
                  
                  {m.description && (
                    <p style={{
                      color: theme.text,
                      opacity: 0.7,
                      fontSize: "0.85rem",
                      marginBottom: "0.5rem",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden"
                    }}>
                      {m.description}
                    </p>
                  )}
                  
                  <div style={{
                    display: "flex",
                    justifyContent: viewMode === "grid" ? "center" : "flex-start",
                    gap: "0.5rem",
                    marginTop: "0.5rem",
                    flexWrap: "wrap"
                  }}>
                    <span style={{
                      background: `rgba(${parseInt(getTypeColor(getType(m)).slice(1,3), 16)}, ${parseInt(getTypeColor(getType(m)).slice(3,5), 16)}, ${parseInt(getTypeColor(getType(m)).slice(5,7), 16)}, 0.2)`,
                      color: getTypeColor(getType(m)),
                      padding: "0.25rem 0.75rem",
                      borderRadius: "20px",
                      fontSize: "0.75rem",
                      fontWeight: 600
                    }}>
                      {getType(m)}
                    </span>
                    
                    {m.created_at && (
                      <span style={{
                        color: "#666",
                        fontSize: "0.7rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem"
                      }}>
                        📅 {new Date(m.created_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filtered.length === 0 && materials.length === 0 && (
          <div style={{
            textAlign: "center",
            padding: "4rem",
            background: "rgba(0,0,0,0.3)",
            borderRadius: "20px"
          }}>
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>📚</div>
            <h3 style={{ color: theme.primary, marginBottom: "0.5rem" }}>No Materials Found</h3>
            <p style={{ color: theme.text, opacity: 0.7, marginBottom: "1.5rem" }}>
              You haven't uploaded any study materials yet.
            </p>
            <button
              onClick={() => navigate("/upload")}
              style={styles.uploadButton}
            >
              ➕ Upload Your First Material
            </button>
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
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
        
        @keyframes fadeOut {
          to {
            opacity: 0;
            visibility: hidden;
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
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
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: ${theme.surface};
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: ${theme.primary};
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: ${theme.secondary};
        }
        
        /* Select dropdown styling */
        select option {
          background: ${theme.surface};
          color: white;
          padding: 10px;
        }
        
        /* Focus visible outline */
        *:focus-visible {
          outline: 2px solid ${theme.primary};
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}

export default ViewMaterials;