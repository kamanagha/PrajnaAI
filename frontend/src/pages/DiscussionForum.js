import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";
import { useTheme } from "../context/ThemeContext";

function DiscussionForum() {
  const navigate = useNavigate();
  const { groupId } = useParams();
  const { currentTheme, themes } = useTheme();
  const theme = themes[currentTheme];
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateTopicModal, setShowCreateTopicModal] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState("");
  const [newTopicContent, setNewTopicContent] = useState("");
  const [newReply, setNewReply] = useState("");
  const [group, setGroup] = useState(null);
  const [popupMessage, setPopupMessage] = useState({ show: false, message: "", type: "" });
  const [replyLoading, setReplyLoading] = useState(false);
  
  const repliesEndRef = useRef(null);
  const replyInputRef = useRef(null);

  useEffect(() => {
    const savedSidebarState = localStorage.getItem("sidebarOpen");
    if (savedSidebarState !== null) {
      setSidebarOpen(savedSidebarState === "true");
    }
    if (groupId) {
      fetchGroupDetails();
      fetchTopics();
    }
  }, [groupId]);

  useEffect(() => {
    if (selectedTopic) {
      fetchReplies(selectedTopic.id);
      scrollToBottom();
    }
  }, [selectedTopic]);

  useEffect(() => {
    scrollToBottom();
  }, [replies]);

  const scrollToBottom = () => {
    repliesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const showPopup = (message, type) => {
    setPopupMessage({ show: true, message, type });
    setTimeout(() => setPopupMessage({ show: false, message: "", type: "" }), 3000);
  };

  const fetchGroupDetails = async () => {
    try {
      const res = await API.get(`/users/study-groups/${groupId}/`);
      setGroup(res.data);
    } catch (error) {
      console.error("Error fetching group:", error);
    }
  };

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/users/discussion-topics/?group_id=${groupId}`);
      setTopics(res.data);
    } catch (error) {
      console.error("Error fetching topics:", error);
      showPopup("Failed to load topics", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchReplies = async (topicId) => {
    try {
      const res = await API.get(`/users/discussion-replies/?topic_id=${topicId}`);
      setReplies(res.data);
    } catch (error) {
      console.error("Error fetching replies:", error);
    }
  };

  const createTopic = async () => {
    if (!newTopicTitle.trim() || !newTopicContent.trim()) {
      showPopup("Please fill in both title and content", "error");
      return;
    }

    try {
      const res = await API.post("/users/discussion-topics/create/", {
        group: parseInt(groupId),
        title: newTopicTitle,
        content: newTopicContent
      });
      showPopup("Topic created successfully!", "success");
      setShowCreateTopicModal(false);
      setNewTopicTitle("");
      setNewTopicContent("");
      fetchTopics();
    } catch (error) {
      showPopup(error.response?.data?.error || "Error creating topic", "error");
    }
  };

  const viewTopic = async (topic) => {
    setSelectedTopic(topic);
    // Increment view count
    try {
      await API.post(`/users/discussion-topics/${topic.id}/view/`);
      // Update view count in local state
      setTopics(prevTopics => 
        prevTopics.map(t => 
          t.id === topic.id ? { ...t, views_count: (t.views_count || 0) + 1 } : t
        )
      );
    } catch (error) {
      console.error("Error updating view count:", error);
    }
  };

  const addReply = async () => {
    if (!newReply.trim() || !selectedTopic) return;
    
    setReplyLoading(true);
    try {
      await API.post("/users/discussion-replies/create/", {
        topic: selectedTopic.id,
        content: newReply
      });
      setNewReply("");
      fetchReplies(selectedTopic.id);
      showPopup("Reply added successfully!", "success");
      // Focus back on reply input
      replyInputRef.current?.focus();
    } catch (error) {
      showPopup(error.response?.data?.error || "Error adding reply", "error");
    } finally {
      setReplyLoading(false);
    }
  };

  const likeReply = async (replyId) => {
    try {
      await API.post(`/users/discussion-replies/${replyId}/like/`);
      fetchReplies(selectedTopic.id);
    } catch (error) {
      console.error("Error liking reply:", error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const toggleSidebar = () => {
    const newState = !sidebarOpen;
    setSidebarOpen(newState);
    localStorage.setItem("sidebarOpen", newState);
  };

  const quickActions = [
    { icon: "👥", title: "Study Groups", description: "Join or create groups", link: "/study-groups", category: "Collaboration" },
    { icon: "💬", title: "Discussion Forum", description: "Discuss topics", link: "/study-groups", category: "Collaboration" },
    { icon: "📤", title: "Upload Materials", description: "Share resources", link: "/upload", category: "Content" },
    { icon: "📂", title: "View Materials", description: "Browse library", link: "/materials", category: "Content" },
    { icon: "📊", title: "Analytics", description: "Track progress", link: "/analytics", category: "Insights" },
    { icon: "🏠", title: "Dashboard", description: "Go to main dashboard", link: "/dashboard", category: "Navigation" }
  ];

  const groupedActions = quickActions.reduce((groups, action) => {
    if (!groups[action.category]) groups[action.category] = [];
    groups[action.category].push(action);
    return groups;
  }, {});

  const styles = {
    container: {
      minHeight: "calc(100vh - 80px)",
      background: `linear-gradient(135deg, ${theme.background} 0%, ${theme.surface} 50%, ${theme.background} 100%)`,
      fontFamily: "'Poppins', 'Segoe UI', sans-serif",
      display: "flex",
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
    modalOverlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0,0,0,0.85)",
      backdropFilter: "blur(8px)",
      zIndex: 10000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      animation: "fadeIn 0.3s ease-out"
    },
    modal: {
      background: `linear-gradient(135deg, ${theme.surface}, ${theme.background})`,
      borderRadius: "24px",
      padding: "2rem",
      maxWidth: "550px",
      width: "90%",
      maxHeight: "85vh",
      overflowY: "auto",
      border: `1px solid ${theme.primary}33`,
      boxShadow: `0 25px 50px -12px rgba(0,0,0,0.5)`,
      animation: "scaleIn 0.3s ease-out"
    }
  };

  return (
    <div style={styles.container}>
      {/* Sidebar Toggle */}
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
              <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem", animation: "bounce 2s ease-in-out infinite" }}>💬</div>
              <h3 style={{ color: theme.primary, fontSize: "1.1rem", fontWeight: 600 }}>Discussion Forum</h3>
              <p style={{ color: theme.text, opacity: 0.7, fontSize: "0.7rem" }}>Share Knowledge, Learn Together</p>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "1rem" }}>
              {Object.entries(groupedActions).map(([category, actions]) => (
                <div key={category} style={{ marginBottom: "1.5rem", animation: "fadeInLeft 0.5s ease-out" }}>
                  <h4 style={{ color: theme.primary, fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", marginBottom: "0.75rem", letterSpacing: "1px" }}>{category}</h4>
                  {actions.map((action, idx) => (
                    <div key={idx} onClick={() => navigate(action.link)} style={{
                      display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem", marginBottom: "0.5rem",
                      borderRadius: "12px", background: "rgba(255,255,255,0.03)", cursor: "pointer", transition: "all 0.3s ease"
                    }} onMouseEnter={(e) => { e.currentTarget.style.background = `${theme.primary}1A`; e.currentTarget.style.transform = "translateX(5px)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.transform = "translateX(0)"; }}>
                      <span style={{ fontSize: "1.2rem" }}>{action.icon}</span>
                      <div>
                        <div style={{ color: "#fff", fontSize: "0.85rem", fontWeight: 500 }}>{action.title}</div>
                        <div style={{ color: theme.text, opacity: 0.7, fontSize: "0.7rem" }}>{action.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div style={{ padding: "1rem", borderTop: `1px solid ${theme.primary}33`, textAlign: "center" }}>
              <button onClick={() => navigate("/dashboard")} style={{
                background: `${theme.primary}33`, border: `1px solid ${theme.primary}`, borderRadius: "8px",
                padding: "0.5rem 1rem", color: theme.primary, fontSize: "0.75rem", cursor: "pointer", width: "100%",
                transition: "all 0.3s ease", fontWeight: 500
              }} onMouseEnter={(e) => { e.currentTarget.style.background = `${theme.primary}4D`; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = `${theme.primary}33`; e.currentTarget.style.transform = "translateY(0)"; }}>
                ← Back to Dashboard
              </button>
            </div>
          </>
        )}
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, marginLeft: sidebarOpen ? "280px" : "0", transition: "margin-left 0.3s ease", padding: "2rem 1.5rem" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem", animation: "fadeInDown 0.5s ease-out" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <button onClick={() => navigate("/study-groups")} style={{
                  background: "none", border: "none", color: theme.primary, cursor: "pointer", fontSize: "0.9rem",
                  display: "flex", alignItems: "center", gap: "0.25rem"
                }} onMouseEnter={(e) => e.currentTarget.style.textDecoration = "underline"}
                  onMouseLeave={(e) => e.currentTarget.style.textDecoration = "none"}>
                  ← Back to Groups
                </button>
              </div>
              <h1 style={{ fontSize: "2rem", fontWeight: 700, color: theme.text, marginBottom: "0.5rem" }}>💬 Discussion Forum</h1>
              <p style={{ color: `${theme.text}CC`, fontSize: "0.9rem" }}>
                {group ? `Discussing in: ${group.name} - ${group.subject}` : "Loading group details..."}
              </p>
            </div>
            <button onClick={() => setShowCreateTopicModal(true)} style={{
              padding: "0.75rem 1.5rem", background: theme.gradient, border: "none", borderRadius: "12px",
              color: "white", cursor: "pointer", fontWeight: 600, transition: "all 0.3s ease", boxShadow: `0 4px 15px ${theme.primary}4D`
            }} onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 6px 20px ${theme.primary}4D`; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `0 4px 15px ${theme.primary}4D`; }}>
              ➕ Create New Topic
            </button>
          </div>

          {!selectedTopic ? (
            // Topics List View
            <div style={{ animation: "fadeInUp 0.5s ease-out" }}>
              <div style={{
                background: `linear-gradient(135deg, rgba(0,0,0,0.6), rgba(20,20,20,0.8))`,
                borderRadius: "20px", border: `1px solid ${theme.primary}33`, overflow: "hidden"
              }}>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "3fr 1fr 1fr 1fr",
                  padding: "1rem 1.5rem",
                  background: `${theme.primary}1A`,
                  borderBottom: `1px solid ${theme.primary}33`,
                  color: theme.primary,
                  fontWeight: 600,
                  fontSize: "0.85rem"
                }}>
                  <div>📌 Topics</div>
                  <div style={{ textAlign: "center" }}>📝 Replies</div>
                  <div style={{ textAlign: "center" }}>👁️ Views</div>
                  <div style={{ textAlign: "center" }}>🕐 Last Active</div>
                </div>
                
                {loading ? (
                  <div style={{ textAlign: "center", padding: "3rem" }}>
                    <div className="spinner" style={{ borderTopColor: theme.primary }}></div>
                    <p style={{ color: theme.text, opacity: 0.7, marginTop: "1rem" }}>Loading topics...</p>
                  </div>
                ) : topics.length > 0 ? (
                  topics.map((topic, idx) => (
                    <div key={topic.id} onClick={() => viewTopic(topic)} style={{
                      display: "grid",
                      gridTemplateColumns: "3fr 1fr 1fr 1fr",
                      padding: "1rem 1.5rem",
                      borderBottom: idx < topics.length - 1 ? `1px solid ${theme.primary}1A` : "none",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      animation: `fadeInUp 0.3s ease-out ${idx * 0.05}s both`
                    }} onMouseEnter={(e) => e.currentTarget.style.background = `${theme.primary}0D`}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                      <div>
                        <div style={{ color: "#fff", fontWeight: 500, marginBottom: "0.25rem" }}>
                          {topic.is_pinned && <span style={{ color: "#ffc107", marginRight: "0.5rem" }}>📌</span>}
                          {topic.title}
                        </div>
                        <div style={{ color: theme.text, opacity: 0.6, fontSize: "0.75rem" }}>
                          by {topic.created_by_name} • {formatDate(topic.created_at)}
                        </div>
                      </div>
                      <div style={{ textAlign: "center", color: theme.text, opacity: 0.7, alignSelf: "center" }}>
                        {topic.reply_count || 0}
                      </div>
                      <div style={{ textAlign: "center", color: theme.text, opacity: 0.7, alignSelf: "center" }}>
                        {topic.views_count || 0}
                      </div>
                      <div style={{ textAlign: "center", color: theme.text, opacity: 0.6, fontSize: "0.75rem", alignSelf: "center" }}>
                        {formatDate(topic.updated_at || topic.created_at)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: "center", padding: "3rem" }}>
                    <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>💬</div>
                    <p style={{ color: theme.text, opacity: 0.7, fontSize: "1rem" }}>No topics yet.</p>
                    <p style={{ color: `${theme.text}99`, fontSize: "0.85rem", marginTop: "0.5rem" }}>Be the first to start a discussion!</p>
                    <button onClick={() => setShowCreateTopicModal(true)} style={{
                      marginTop: "1rem", padding: "0.5rem 1rem", background: theme.gradient, border: "none",
                      borderRadius: "8px", color: "white", cursor: "pointer"
                    }}>Create First Topic</button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Single Topic View with Replies
            <div style={{ animation: "fadeInUp 0.5s ease-out" }}>
              {/* Back Button */}
              <button onClick={() => setSelectedTopic(null)} style={{
                background: "none", border: "none", color: theme.primary, cursor: "pointer",
                fontSize: "0.9rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.25rem"
              }} onMouseEnter={(e) => e.currentTarget.style.textDecoration = "underline"}
                onMouseLeave={(e) => e.currentTarget.style.textDecoration = "none"}>
                ← Back to all topics
              </button>

              {/* Topic Header */}
              <div style={{
                background: `linear-gradient(135deg, rgba(0,0,0,0.6), rgba(20,20,20,0.8))`,
                borderRadius: "20px", padding: "1.5rem", marginBottom: "1.5rem", border: `1px solid ${theme.primary}33`
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: "1rem", marginBottom: "1rem" }}>
                  <h2 style={{ color: "#fff", fontSize: "1.5rem", fontWeight: 600 }}>{selectedTopic.title}</h2>
                  {selectedTopic.is_pinned && <span style={{ background: "#ffc10720", padding: "0.25rem 0.75rem", borderRadius: "20px", color: "#ffc107", fontSize: "0.75rem" }}>📌 Pinned</span>}
                </div>
                <div style={{ color: theme.text, opacity: 0.7, fontSize: "0.85rem", marginBottom: "1rem" }}>
                  Posted by <span style={{ color: theme.primary }}>{selectedTopic.created_by_name}</span> • {formatDate(selectedTopic.created_at)}
                  {selectedTopic.views_count > 0 && ` • 👁️ ${selectedTopic.views_count} views`}
                </div>
                <div style={{ color: theme.text, fontSize: "1rem", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                  {selectedTopic.content}
                </div>
                {selectedTopic.is_locked && (
                  <div style={{ marginTop: "1rem", padding: "0.5rem", background: "rgba(220,53,69,0.1)", borderRadius: "8px", color: "#dc3545", fontSize: "0.85rem" }}>
                    🔒 This topic is locked. No new replies can be added.
                  </div>
                )}
              </div>

              {/* Replies Section */}
              <div style={{
                background: `linear-gradient(135deg, rgba(0,0,0,0.6), rgba(20,20,20,0.8))`,
                borderRadius: "20px", padding: "1.5rem", border: `1px solid ${theme.primary}33`
              }}>
                <h3 style={{ color: theme.primary, marginBottom: "1rem", fontSize: "1.2rem" }}>
                  💬 Replies ({replies.length})
                </h3>
                
                {replies.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
                    {replies.map((reply, idx) => (
                      <div key={reply.id} style={{
                        padding: "1rem",
                        background: reply.is_solution ? `${theme.primary}1A` : "rgba(255,255,255,0.03)",
                        borderRadius: "12px",
                        borderLeft: reply.is_solution ? `3px solid ${theme.primary}` : "none",
                        animation: `fadeInUp 0.3s ease-out ${idx * 0.05}s both`
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem", flexWrap: "wrap", gap: "0.5rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <span style={{ fontSize: "1.2rem" }}>👤</span>
                            <span style={{ color: theme.primary, fontWeight: 500 }}>{reply.created_by_name}</span>
                            <span style={{ color: theme.text, opacity: 0.5, fontSize: "0.7rem" }}>{formatDate(reply.created_at)}</span>
                          </div>
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            {reply.is_solution && (
                              <span style={{ background: `${theme.primary}33`, padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.7rem", color: theme.primary }}>
                                ✅ Solution
                              </span>
                            )}
                            <button onClick={() => likeReply(reply.id)} style={{
                              background: "none", border: "none", cursor: "pointer", fontSize: "0.85rem",
                              color: reply.user_has_liked ? "#e74c3c" : theme.text, opacity: 0.7,
                              display: "flex", alignItems: "center", gap: "0.25rem"
                            }} onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
                              onMouseLeave={(e) => e.currentTarget.style.opacity = "0.7"}>
                              ❤️ {reply.likes_count || 0}
                            </button>
                          </div>
                        </div>
                        <div style={{ color: theme.text, fontSize: "0.95rem", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                          {reply.content}
                        </div>
                      </div>
                    ))}
                    <div ref={repliesEndRef} />
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "2rem" }}>
                    <p style={{ color: theme.text, opacity: 0.7 }}>No replies yet. Be the first to respond!</p>
                  </div>
                )}

                {/* Add Reply Form */}
                {!selectedTopic?.is_locked ? (
                  <div style={{ marginTop: "1rem", borderTop: `1px solid ${theme.primary}33`, paddingTop: "1rem" }}>
                    <textarea
                      ref={replyInputRef}
                      placeholder="Write your reply..."
                      value={newReply}
                      onChange={(e) => setNewReply(e.target.value)}
                      rows="3"
                      style={{
                        width: "100%",
                        padding: "0.85rem",
                        background: "rgba(255,255,255,0.05)",
                        border: `1px solid ${theme.primary}4D`,
                        borderRadius: "12px",
                        color: "#fff",
                        fontSize: "0.95rem",
                        resize: "vertical",
                        fontFamily: "inherit",
                        marginBottom: "1rem"
                      }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = theme.primary; e.currentTarget.style.boxShadow = `0 0 0 3px ${theme.primary}1A`; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = `${theme.primary}4D`; e.currentTarget.style.boxShadow = "none"; }}
                    />
                    <button
                      onClick={addReply}
                      disabled={replyLoading || !newReply.trim()}
                      style={{
                        padding: "0.75rem 1.5rem",
                        background: theme.gradient,
                        border: "none",
                        borderRadius: "12px",
                        color: "white",
                        cursor: replyLoading || !newReply.trim() ? "not-allowed" : "pointer",
                        fontWeight: 600,
                        transition: "all 0.3s ease",
                        opacity: replyLoading || !newReply.trim() ? 0.6 : 1
                      }}
                      onMouseEnter={(e) => { if (!replyLoading && newReply.trim()) e.currentTarget.style.transform = "translateY(-2px)"; }}
                      onMouseLeave={(e) => { if (!replyLoading && newReply.trim()) e.currentTarget.style.transform = "translateY(0)"; }}
                    >
                      {replyLoading ? "Posting..." : "💬 Post Reply"}
                    </button>
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "1rem", background: "rgba(220,53,69,0.1)", borderRadius: "8px", color: "#dc3545" }}>
                    🔒 This topic is locked. You cannot add new replies.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Topic Modal */}
      {showCreateTopicModal && (
        <div style={styles.modalOverlay} onClick={() => setShowCreateTopicModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ color: theme.primary, marginBottom: "1rem", fontSize: "1.5rem" }}>✨ Create New Discussion Topic</h2>
            <input
              type="text"
              placeholder="📌 Topic Title *"
              value={newTopicTitle}
              onChange={(e) => setNewTopicTitle(e.target.value)}
              style={{
                width: "100%",
                padding: "0.85rem",
                marginBottom: "1rem",
                background: "rgba(255,255,255,0.05)",
                border: `1px solid ${theme.primary}4D`,
                borderRadius: "10px",
                color: "#fff",
                fontSize: "0.95rem"
              }}
            />
            <textarea
              placeholder="📝 Topic Content *"
              value={newTopicContent}
              onChange={(e) => setNewTopicContent(e.target.value)}
              rows="6"
              style={{
                width: "100%",
                padding: "0.85rem",
                marginBottom: "1rem",
                background: "rgba(255,255,255,0.05)",
                border: `1px solid ${theme.primary}4D`,
                borderRadius: "10px",
                color: "#fff",
                fontSize: "0.95rem",
                resize: "vertical"
              }}
            />
            <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
              <button onClick={createTopic} style={{
                flex: 1, padding: "0.85rem", background: theme.gradient, border: "none",
                borderRadius: "10px", color: "white", cursor: "pointer", fontWeight: 600
              }}>Create Topic</button>
              <button onClick={() => setShowCreateTopicModal(false)} style={{
                flex: 1, padding: "0.85rem", background: "rgba(108,117,125,0.2)",
                border: "1px solid #6c757d", borderRadius: "10px", color: "#a0a0a0", cursor: "pointer"
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Popup Message */}
      {popupMessage.show && (
        <div style={{ position: "fixed", top: "20px", right: "20px", zIndex: 10001, animation: "slideInRight 0.3s ease-out" }}>
          <div style={{
            background: popupMessage.type === "success" ? "linear-gradient(135deg, #28a745, #20c997)" : "linear-gradient(135deg, #dc3545, #c82333)",
            color: "white", padding: "1rem 1.5rem", borderRadius: "12px", display: "flex", alignItems: "center", gap: "0.75rem", boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
          }}>
            <span style={{ fontSize: "1.2rem" }}>{popupMessage.type === "success" ? "✅" : "⚠️"}</span>
            <span style={{ fontSize: "0.9rem" }}>{popupMessage.message}</span>
            <button onClick={() => setPopupMessage({ show: false, message: "", type: "" })} style={{ background: "none", border: "none", color: "white", cursor: "pointer", fontSize: "1rem", marginLeft: "0.5rem" }}>✕</button>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
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
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        .spinner {
          display: inline-block;
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255,255,255,0.1);
          border-top: 3px solid ${theme.primary};
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        ::-webkit-scrollbar {
          width: 6px;
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

export default DiscussionForum;