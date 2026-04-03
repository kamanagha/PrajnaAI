import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

function ViewMaterials() {
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

  const navigate = useNavigate();
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
      default: return "#FF8C00";
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

  return (
    <div style={{
      minHeight: "calc(100vh - 80px)",
      background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0d0d0d 100%)",
      padding: "2rem 1.5rem",
      fontFamily: "'Poppins', 'Segoe UI', 'Montserrat', system-ui, sans-serif",
      position: "relative"
    }}>
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.8)",
          backdropFilter: "blur(5px)",
          zIndex: 10000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: "fadeIn 0.3s ease-out"
        }}>
          <div style={{
            background: "linear-gradient(135deg, #1a1a1a, #0d0d0d)",
            borderRadius: "20px",
            padding: "2rem",
            maxWidth: "400px",
            textAlign: "center",
            border: "1px solid rgba(255, 68, 68, 0.3)"
          }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
            <h3 style={{ color: "#FF4444", marginBottom: "1rem" }}>Confirm Delete</h3>
            <p style={{ color: "#a0a0a0", marginBottom: "1.5rem" }}>
              Are you sure you want to delete this material? This action cannot be undone.
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                style={{
                  padding: "0.7rem 1.5rem",
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "10px",
                  color: "#ffffff",
                  cursor: "pointer"
                }}
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
                  cursor: "pointer"
                }}
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
              background: "linear-gradient(135deg, #FF6B00, #FF8C00, #FFA500)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
              marginBottom: "0.5rem"
            }}>
              📚 My Study Materials
            </h1>
            <p style={{ color: "#a0a0a0", fontSize: "1rem" }}>
              Welcome back, <span style={{ color: "#FFA500", fontWeight: 600 }}>{currentUserName}</span>! 
              Manage and access your learning resources
            </p>
          </div>
          
          {/* Add Material Button */}
          <button
            onClick={() => navigate("/upload")}
            style={{
              padding: "0.8rem 1.5rem",
              background: "linear-gradient(135deg, #FF6B00, #FF8C00)",
              border: "none",
              borderRadius: "12px",
              color: "white",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              transition: "all 0.3s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 5px 15px rgba(255, 107, 0, 0.3)";
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
          <div style={{
            background: "linear-gradient(135deg, rgba(0,0,0,0.6), rgba(20,20,20,0.8))",
            borderRadius: "16px",
            padding: "1rem",
            textAlign: "center",
            border: "1px solid rgba(255, 140, 0, 0.2)"
          }}>
            <div style={{ fontSize: "2rem" }}>📚</div>
            <div style={{ color: "#FFA500", fontSize: "1.5rem", fontWeight: 700 }}>{stats.total}</div>
            <div style={{ color: "#a0a0a0", fontSize: "0.85rem" }}>Total Materials</div>
          </div>
          <div style={{
            background: "linear-gradient(135deg, rgba(0,0,0,0.6), rgba(20,20,20,0.8))",
            borderRadius: "16px",
            padding: "1rem",
            textAlign: "center",
            border: "1px solid rgba(66, 133, 244, 0.2)"
          }}>
            <div style={{ fontSize: "2rem" }}>👤</div>
            <div style={{ color: "#4285F4", fontSize: "1.5rem", fontWeight: 700 }}>{stats.myMaterials}</div>
            <div style={{ color: "#a0a0a0", fontSize: "0.85rem" }}>My Materials</div>
          </div>
          <div style={{
            background: "linear-gradient(135deg, rgba(0,0,0,0.6), rgba(20,20,20,0.8))",
            borderRadius: "16px",
            padding: "1rem",
            textAlign: "center",
            border: "1px solid rgba(255, 68, 68, 0.2)"
          }}>
            <div style={{ fontSize: "2rem" }}>📄</div>
            <div style={{ color: "#FF4444", fontSize: "1.5rem", fontWeight: 700 }}>{stats.pdfs}</div>
            <div style={{ color: "#a0a0a0", fontSize: "0.85rem" }}>PDF Files</div>
          </div>
          <div style={{
            background: "linear-gradient(135deg, rgba(0,0,0,0.6), rgba(20,20,20,0.8))",
            borderRadius: "16px",
            padding: "1rem",
            textAlign: "center",
            border: "1px solid rgba(156, 39, 176, 0.2)"
          }}>
            <div style={{ fontSize: "2rem" }}>📘</div>
            <div style={{ color: "#9C27B0", fontSize: "1.5rem", fontWeight: 700 }}>{stats.notes}</div>
            <div style={{ color: "#a0a0a0", fontSize: "0.85rem" }}>Notes</div>
          </div>
        </div>

        {/* Filters Section */}
        <div style={{
          background: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(10px)",
          borderRadius: "20px",
          padding: "1.5rem",
          marginBottom: "2rem",
          border: "1px solid rgba(255, 140, 0, 0.2)"
        }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
            alignItems: "end"
          }}>
            {/* Search Input */}
            <div>
              <label style={{
                display: "block",
                color: "#FFA500",
                marginBottom: "0.5rem",
                fontSize: "0.85rem",
                fontWeight: 500
              }}>
                🔍 Search Materials
              </label>
              <input
                type="text"
                placeholder="Search by title, subject..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.7rem 1rem",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 140, 0, 0.3)",
                  borderRadius: "12px",
                  color: "#ffffff",
                  fontSize: "0.9rem",
                  transition: "all 0.3s ease",
                  outline: "none"
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#FF8C00";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(255, 140, 0, 0.1)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255, 140, 0, 0.3)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>

            {/* File Type Filter */}
            <div>
              <label style={{
                display: "block",
                color: "#FFA500",
                marginBottom: "0.5rem",
                fontSize: "0.85rem",
                fontWeight: 500
              }}>
                📂 File Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.7rem 1rem",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 140, 0, 0.3)",
                  borderRadius: "12px",
                  color: "#ffffff",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  outline: "none"
                }}
              >
                <option value="all">All Types</option>
                <option value="pdf">PDF</option>
                <option value="doc">DOC</option>
                <option value="note">Notes</option>
              </select>
            </div>

            {/* Subject Filter */}
            {subjects.length > 0 && (
              <div>
                <label style={{
                  display: "block",
                  color: "#FFA500",
                  marginBottom: "0.5rem",
                  fontSize: "0.85rem",
                  fontWeight: 500
                }}>
                  📚 Subject
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.7rem 1rem",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 140, 0, 0.3)",
                    borderRadius: "12px",
                    color: "#ffffff",
                    fontSize: "0.9rem",
                    cursor: "pointer",
                    outline: "none"
                  }}
                >
                  <option value="all">All Subjects</option>
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Sort By */}
            <div>
              <label style={{
                display: "block",
                color: "#FFA500",
                marginBottom: "0.5rem",
                fontSize: "0.85rem",
                fontWeight: 500
              }}>
                🔄 Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.7rem 1rem",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 140, 0, 0.3)",
                  borderRadius: "12px",
                  color: "#ffffff",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  outline: "none"
                }}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title-asc">Title (A-Z)</option>
                <option value="title-desc">Title (Z-A)</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div>
              <label style={{
                display: "block",
                color: "#FFA500",
                marginBottom: "0.5rem",
                fontSize: "0.85rem",
                fontWeight: 500
              }}>
                👁️ View Mode
              </label>
              <div style={{
                display: "flex",
                gap: "0.5rem"
              }}>
                <button
                  onClick={() => setViewMode("grid")}
                  style={{
                    flex: 1,
                    padding: "0.7rem",
                    background: viewMode === "grid" 
                      ? "linear-gradient(135deg, #FF6B00, #FF8C00)"
                      : "rgba(255, 255, 255, 0.05)",
                    border: viewMode === "grid" 
                      ? "none"
                      : "1px solid rgba(255, 140, 0, 0.3)",
                    borderRadius: "12px",
                    color: viewMode === "grid" ? "white" : "#FFA500",
                    cursor: "pointer",
                    transition: "all 0.3s ease"
                  }}
                >
                  📱 Grid
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  style={{
                    flex: 1,
                    padding: "0.7rem",
                    background: viewMode === "list" 
                      ? "linear-gradient(135deg, #FF6B00, #FF8C00)"
                      : "rgba(255, 255, 255, 0.05)",
                    border: viewMode === "list" 
                      ? "none"
                      : "1px solid rgba(255, 140, 0, 0.3)",
                    borderRadius: "12px",
                    color: viewMode === "list" ? "white" : "#FFA500",
                    cursor: "pointer",
                    transition: "all 0.3s ease"
                  }}
                >
                  📋 List
                </button>
              </div>
            </div>
          </div>

          {/* Clear Filters Button */}
          {(search || type !== "all" || selectedSubject !== "all" || sortBy !== "newest") && (
            <button
              onClick={clearFilters}
              style={{
                marginTop: "1rem",
                padding: "0.5rem 1rem",
                background: "rgba(255, 107, 0, 0.2)",
                border: "1px solid #FF6B00",
                borderRadius: "10px",
                color: "#FFA500",
                cursor: "pointer",
                fontSize: "0.85rem",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 107, 0, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 107, 0, 0.2)";
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
          <p style={{ color: "#a0a0a0", fontSize: "0.9rem" }}>
            Showing {filtered.length} of {materials.length} materials
          </p>
          {filtered.length === 0 && materials.length > 0 && (
            <p style={{ color: "#FFA500", fontSize: "0.9rem" }}>
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
            <div className="spinner"></div>
            <p style={{ color: "#FFA500", marginLeft: "1rem" }}>Loading materials...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div style={{
            background: "rgba(220, 53, 69, 0.1)",
            border: "1px solid rgba(220, 53, 69, 0.3)",
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
                  cursor: "pointer",
                  background: "linear-gradient(135deg, rgba(0,0,0,0.6), rgba(20,20,20,0.8))",
                  borderRadius: "16px",
                  padding: viewMode === "grid" ? "1.5rem" : "1rem",
                  border: "1px solid rgba(255, 140, 0, 0.2)",
                  transition: "all 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1)",
                  display: viewMode === "list" ? "flex" : "block",
                  alignItems: viewMode === "list" ? "center" : "stretch",
                  gap: viewMode === "list" ? "1rem" : "0",
                  position: "relative"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.borderColor = "rgba(255, 140, 0, 0.5)";
                  e.currentTarget.style.boxShadow = "0 10px 30px rgba(255, 107, 0, 0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = "rgba(255, 140, 0, 0.2)";
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
                    style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      background: "rgba(220, 53, 69, 0.9)",
                      border: "none",
                      borderRadius: "8px",
                      padding: "5px 10px",
                      color: "white",
                      cursor: "pointer",
                      fontSize: "0.8rem",
                      transition: "all 0.3s ease",
                      zIndex: 10
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#dc3545";
                      e.currentTarget.style.transform = "scale(1.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(220, 53, 69, 0.9)";
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  >
                    🗑️ Delete
                  </button>
                )}

                {/* Owner Badge */}
                {String(m.user_id) === String(currentUser) && (
                  <div style={{
                    position: "absolute",
                    top: "10px",
                    left: "10px",
                    background: "rgba(255, 107, 0, 0.2)",
                    border: "1px solid #FF6B00",
                    borderRadius: "6px",
                    padding: "2px 8px",
                    fontSize: "0.7rem",
                    color: "#FFA500",
                    zIndex: 10
                  }}>
                    My Material
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
                    paddingRight: viewMode === "grid" ? "0" : "60px"
                  }}>
                    {m.title}
                  </h5>
                  
                  {m.subject && (
                    <p style={{
                      color: "#FFA500",
                      fontSize: "0.85rem",
                      marginBottom: "0.5rem"
                    }}>
                      📖 {m.subject}
                    </p>
                  )}
                  
                  {m.description && (
                    <p style={{
                      color: "#a0a0a0",
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
            <h3 style={{ color: "#FFA500", marginBottom: "0.5rem" }}>No Materials Found</h3>
            <p style={{ color: "#a0a0a0", marginBottom: "1.5rem" }}>
              You haven't uploaded any study materials yet.
            </p>
            <button
              onClick={() => navigate("/upload")}
              style={{
                padding: "0.8rem 1.5rem",
                background: "linear-gradient(135deg, #FF6B00, #FF8C00)",
                border: "none",
                borderRadius: "12px",
                color: "white",
                fontWeight: 600,
                cursor: "pointer"
              }}
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
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
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
      `}</style>
    </div>
  );
}

export default ViewMaterials;