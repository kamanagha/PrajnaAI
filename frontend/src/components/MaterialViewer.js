import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

function MaterialViewer() {
  const { currentTheme, themes } = useTheme();
  const theme = themes[currentTheme];
  
  const [materials, setMaterials] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [subjects, setSubjects] = useState([]);

  const navigate = useNavigate();

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
      console.error("Error fetching materials:", err);
    } finally {
      setLoading(false);
    }
  };

  // Get file type
  const getType = (m) => {
    if (m.file && m.file.includes(".pdf")) return "PDF";
    if (m.file && m.file.includes(".doc")) return "DOC";
    if (m.file && m.file.includes(".txt")) return "NOTE";
    if (m.file && m.file.includes(".ppt")) return "PPT";
    if (m.file && m.file.includes(".xlsx")) return "EXCEL";
    return "NOTE";
  };

  // Get file icon based on type
  const getFileIcon = (type) => {
    switch(type) {
      case "PDF": return "📄";
      case "DOC": return "📝";
      case "PPT": return "📊";
      case "EXCEL": return "📈";
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
      default: return theme.primary;
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
    const pdfs = materials.filter(m => getType(m) === "PDF").length;
    const docs = materials.filter(m => getType(m) === "DOC").length;
    const notes = materials.filter(m => getType(m) === "NOTE").length;
    return { total, pdfs, docs, notes };
  };

  const stats = getStatistics();

  // Dynamic styles based on theme
  const styles = {
    container: {
      minHeight: "calc(100vh - 80px)",
      background: `linear-gradient(135deg, ${theme.background} 0%, ${theme.surface} 50%, ${theme.background} 100%)`,
      padding: "2rem 1.5rem",
      fontFamily: "'Poppins', 'Segoe UI', 'Montserrat', system-ui, sans-serif",
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
      transition: "all 0.3s ease"
    }),
    filtersContainer: {
      background: "rgba(0, 0, 0, 0.5)",
      backdropFilter: "blur(10px)",
      borderRadius: "20px",
      padding: "1.5rem",
      marginBottom: "2rem",
      border: `1px solid ${theme.primary}33`,
      transition: "all 0.3s ease"
    },
    label: {
      display: "block",
      color: theme.primary,
      marginBottom: "0.5rem",
      fontSize: "0.85rem",
      fontWeight: 500
    },
    input: {
      width: "100%",
      padding: "0.7rem 1rem",
      background: "rgba(255, 255, 255, 0.05)",
      border: `1px solid ${theme.primary}4D`,
      borderRadius: "12px",
      color: "#ffffff",
      fontSize: "0.9rem",
      transition: "all 0.3s ease",
      outline: "none"
    },
    select: {
      width: "100%",
      padding: "0.7rem 1rem",
      background: "rgba(255, 255, 255, 0.05)",
      border: `1px solid ${theme.primary}4D`,
      borderRadius: "12px",
      color: "#ffffff",
      fontSize: "0.9rem",
      cursor: "pointer",
      outline: "none"
    },
    viewButton: (isActive) => ({
      flex: 1,
      padding: "0.7rem",
      background: isActive 
        ? theme.gradient
        : "rgba(255, 255, 255, 0.05)",
      border: isActive 
        ? "none"
        : `1px solid ${theme.primary}4D`,
      borderRadius: "12px",
      color: isActive ? "white" : theme.primary,
      cursor: "pointer",
      transition: "all 0.3s ease"
    }),
    clearButton: {
      marginTop: "1rem",
      padding: "0.5rem 1rem",
      background: `${theme.primary}33`,
      border: `1px solid ${theme.primary}`,
      borderRadius: "10px",
      color: theme.primary,
      cursor: "pointer",
      fontSize: "0.85rem",
      transition: "all 0.3s ease"
    },
    materialCard: {
      cursor: "pointer",
      background: "linear-gradient(135deg, rgba(0,0,0,0.6), rgba(20,20,20,0.8))",
      borderRadius: "16px",
      border: `1px solid ${theme.primary}33`,
      transition: "all 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1)",
    },
    cardHover: {
      transform: "translateY(-5px)",
      borderColor: `${theme.primary}80`,
      boxShadow: `0 10px 30px ${theme.primary}33`
    },
    typeBadge: (color) => ({
      background: `rgba(${parseInt(color.slice(1,3), 16)}, ${parseInt(color.slice(3,5), 16)}, ${parseInt(color.slice(5,7), 16)}, 0.2)`,
      color: color,
      padding: "0.25rem 0.75rem",
      borderRadius: "20px",
      fontSize: "0.75rem",
      fontWeight: 600
    }),
    emptyState: {
      textAlign: "center",
      padding: "4rem",
      background: "rgba(0,0,0,0.3)",
      borderRadius: "20px"
    },
    errorState: {
      background: "rgba(220, 53, 69, 0.1)",
      border: "1px solid rgba(220, 53, 69, 0.3)",
      borderRadius: "12px",
      padding: "1rem",
      textAlign: "center",
      color: "#ff6b6b"
    }
  };

  return (
    <div style={styles.container}>
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
        {/* Header */}
        <div style={{
          textAlign: "center",
          marginBottom: "2rem"
        }}>
          <h1 style={{
            fontSize: "2.5rem",
            fontWeight: 800,
            ...styles.gradientText,
            marginBottom: "0.5rem"
          }}>
            📚 Study Materials Library
          </h1>
          <p style={{
            color: theme.text,
            opacity: 0.8,
            fontSize: "1rem"
          }}>
            Explore, search, and access your learning resources
          </p>
        </div>

        {/* Statistics Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem"
        }}>
          <div style={styles.statCard(`${theme.primary}33`)}>
            <div style={{ fontSize: "2rem" }}>📚</div>
            <div style={{ color: theme.primary, fontSize: "1.5rem", fontWeight: 700 }}>{stats.total}</div>
            <div style={{ color: theme.text, opacity: 0.7, fontSize: "0.85rem" }}>Total Materials</div>
          </div>
          <div style={styles.statCard("#FF444433")}>
            <div style={{ fontSize: "2rem" }}>📄</div>
            <div style={{ color: "#FF4444", fontSize: "1.5rem", fontWeight: 700 }}>{stats.pdfs}</div>
            <div style={{ color: theme.text, opacity: 0.7, fontSize: "0.85rem" }}>PDF Documents</div>
          </div>
          <div style={styles.statCard("#4285F433")}>
            <div style={{ fontSize: "2rem" }}>📝</div>
            <div style={{ color: "#4285F4", fontSize: "1.5rem", fontWeight: 700 }}>{stats.docs}</div>
            <div style={{ color: theme.text, opacity: 0.7, fontSize: "0.85rem" }}>Documents</div>
          </div>
          <div style={styles.statCard(`${theme.secondary}33`)}>
            <div style={{ fontSize: "2rem" }}>📘</div>
            <div style={{ color: theme.secondary, fontSize: "1.5rem", fontWeight: 700 }}>{stats.notes}</div>
            <div style={{ color: theme.text, opacity: 0.7, fontSize: "0.85rem" }}>Notes</div>
          </div>
        </div>

        {/* Filters Section */}
        <div style={styles.filtersContainer}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
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
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = `${theme.primary}4D`;
                  e.currentTarget.style.boxShadow = "none";
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
                <label style={styles.label}>
                  📚 Subject
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  style={styles.select}
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
              <label style={styles.label}>
                🔄 Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={styles.select}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title-asc">Title (A-Z)</option>
                <option value="title-desc">Title (Z-A)</option>
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
                  📱 Grid
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  style={styles.viewButton(viewMode === "list")}
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
              style={styles.clearButton}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `${theme.primary}4D`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = `${theme.primary}33`;
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
            Showing {filtered.length} of {materials.length} materials
          </p>
          {filtered.length === 0 && materials.length > 0 && (
            <p style={{ color: theme.primary, fontSize: "0.9rem" }}>
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
          <div style={styles.errorState}>
            ⚠️ {error}
          </div>
        )}

        {/* Materials Grid/List View */}
        {!loading && !error && (
          <div style={{
            display: viewMode === "grid" ? "grid" : "flex",
            gridTemplateColumns: viewMode === "grid" ? "repeat(auto-fill, minmax(300px, 1fr))" : "none",
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
                    wordBreak: "break-word"
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
                    <span style={styles.typeBadge(getTypeColor(getType(m)))}>
                      {getType(m)}
                    </span>
                    
                    {m.created_at && (
                      <span style={{
                        color: theme.text,
                        opacity: 0.5,
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
          <div style={styles.emptyState}>
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>📚</div>
            <h3 style={{ color: theme.primary, marginBottom: "0.5rem" }}>No Materials Found</h3>
            <p style={{ color: theme.text, opacity: 0.7 }}>There are no study materials available at the moment.</p>
          </div>
        )}
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
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .material-card {
          animation: fadeIn 0.5s ease-out;
        }
        
        input, select, button {
          transition: all 0.3s ease;
        }
        
        input:hover, select:hover {
          border-color: ${theme.primary} !important;
        }
      `}</style>
    </div>
  );
}

export default MaterialViewer;