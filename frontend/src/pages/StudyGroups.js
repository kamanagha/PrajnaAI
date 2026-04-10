import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { useTheme } from "../context/ThemeContext";

function StudyGroups() {
  const navigate = useNavigate();
  const { currentTheme, themes } = useTheme();
  const theme = themes[currentTheme];
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [groups, setGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [replies, setReplies] = useState([]);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState("");
  const [newTopicContent, setNewTopicContent] = useState("");
  const [newReply, setNewReply] = useState("");
  const [events, setEvents] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    event_date: "",
    location: "",
    meeting_link: ""
  });
  const [groupMembers, setGroupMembers] = useState([]);
  const [activeTab, setActiveTab] = useState("chat");
  const [popupMessage, setPopupMessage] = useState({ show: false, message: "", type: "" });
  const [showGroupDetailModal, setShowGroupDetailModal] = useState(false);
  
  const messagesEndRef = useRef(null);
  const ws = useRef(null);

  // New Group Form State
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    subject: "",
    is_private: false,
    max_members: 50,
    avatar: "👥"
  });

  useEffect(() => {
    const savedSidebarState = localStorage.getItem("sidebarOpen");
    if (savedSidebarState !== null) {
      setSidebarOpen(savedSidebarState === "true");
    }
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    await fetchGroups();
    await fetchMyGroups();
  };

  useEffect(() => {
    if (selectedGroup) {
      fetchMessages(selectedGroup.id);
      fetchTopics(selectedGroup.id);
      fetchEvents(selectedGroup.id);
      fetchGroupMembers(selectedGroup.id);
      connectWebSocket(selectedGroup.id);
    }
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [selectedGroup]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const showPopup = (message, type) => {
    setPopupMessage({ show: true, message, type });
    setTimeout(() => setPopupMessage({ show: false, message: "", type: "" }), 3000);
  };

  const connectWebSocket = (groupId) => {
    const wsUrl = `ws://127.0.0.1:8000/ws/group/${groupId}/`;
    ws.current = new WebSocket(wsUrl);
    
    ws.current.onopen = () => {
      console.log("WebSocket connected");
    };
    
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages(prev => [...prev, data]);
      scrollToBottom();
    };
    
    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
    
    ws.current.onclose = () => {
      console.log("WebSocket disconnected");
    };
  };

  const fetchGroups = async () => {
    try {
      const res = await API.get("/users/study-groups/");
      setGroups(res.data);
    } catch (error) {
      console.error("Error fetching groups:", error);
      showPopup("Failed to load groups", "error");
    }
  };

  const fetchMyGroups = async () => {
    try {
      const res = await API.get("/users/study-groups/my-groups/");
      setMyGroups(res.data);
    } catch (error) {
      console.error("Error fetching my groups:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (groupId) => {
    try {
      const res = await API.get(`/users/group-messages/?group_id=${groupId}`);
      setMessages(res.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const fetchTopics = async (groupId) => {
    try {
      const res = await API.get(`/users/discussion-topics/?group_id=${groupId}`);
      setTopics(res.data);
    } catch (error) {
      console.error("Error fetching topics:", error);
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

  const fetchEvents = async (groupId) => {
    try {
      const res = await API.get(`/users/group-events/?group_id=${groupId}`);
      setEvents(res.data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const fetchGroupMembers = async (groupId) => {
    try {
      const res = await API.get(`/users/study-groups/${groupId}/members/`);
      setGroupMembers(res.data);
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  };

  const createGroup = async () => {
    if (!newGroup.name || !newGroup.description || !newGroup.subject) {
      showPopup("Please fill all required fields", "error");
      return;
    }
    
    try {
      const res = await API.post("/users/study-groups/create/", newGroup);
      showPopup("Group created successfully!", "success");
      setShowCreateModal(false);
      setNewGroup({
        name: "",
        description: "",
        subject: "",
        is_private: false,
        max_members: 50,
        avatar: "👥"
      });
      await fetchAllData();
    } catch (error) {
      showPopup(error.response?.data?.error || "Error creating group", "error");
    }
  };

  const joinGroup = async () => {
    if (!selectedGroup) {
      showPopup("Please select a group first", "error");
      return;
    }
    
    if (selectedGroup.is_private && !joinCode) {
      showPopup("Please enter join code", "error");
      return;
    }
    
    try {
      await API.post(`/users/study-groups/${selectedGroup.id}/join/`, { join_code: joinCode });
      showPopup("Joined group successfully!", "success");
      setShowJoinModal(false);
      setJoinCode("");
      await fetchAllData();
      setSelectedGroup(null);
    } catch (error) {
      showPopup(error.response?.data?.error || "Error joining group", "error");
    }
  };

  const leaveGroup = async (groupId) => {
    if (window.confirm("Are you sure you want to leave this group?")) {
      try {
        await API.post(`/users/study-groups/${groupId}/leave/`);
        showPopup("Left group successfully", "success");
        await fetchAllData();
        if (selectedGroup?.id === groupId) {
          setSelectedGroup(null);
          setShowGroupDetailModal(false);
        }
      } catch (error) {
        showPopup(error.response?.data?.error || "Error leaving group", "error");
      }
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedGroup) return;
    
    try {
      const messageData = {
        group: selectedGroup.id,
        message: newMessage
      };
      
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify(messageData));
      }
      
      await API.post("/users/group-messages/send/", messageData);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      showPopup("Error sending message", "error");
    }
  };

  const createTopic = async () => {
    if (!newTopicTitle || !newTopicContent) {
      showPopup("Please fill all fields", "error");
      return;
    }
    
    try {
      await API.post("/users/discussion-topics/create/", {
        group: selectedGroup.id,
        title: newTopicTitle,
        content: newTopicContent
      });
      showPopup("Topic created successfully!", "success");
      setShowTopicModal(false);
      setNewTopicTitle("");
      setNewTopicContent("");
      fetchTopics(selectedGroup.id);
    } catch (error) {
      showPopup(error.response?.data?.error || "Error creating topic", "error");
    }
  };

  const viewTopic = async (topic) => {
    setSelectedTopic(topic);
    await fetchReplies(topic.id);
    try {
      await API.post(`/users/discussion-topics/${topic.id}/view/`);
    } catch (error) {
      console.error("Error updating view count:", error);
    }
  };

  const addReply = async () => {
    if (!newReply.trim() || !selectedTopic) return;
    
    try {
      await API.post("/users/discussion-replies/create/", {
        topic: selectedTopic.id,
        content: newReply
      });
      setNewReply("");
      fetchReplies(selectedTopic.id);
      showPopup("Reply added!", "success");
    } catch (error) {
      showPopup(error.response?.data?.error || "Error adding reply", "error");
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

  const createEvent = async () => {
    if (!newEvent.title || !newEvent.description || !newEvent.event_date) {
      showPopup("Please fill all required fields", "error");
      return;
    }
    
    try {
      await API.post("/users/group-events/create/", {
        group: selectedGroup.id,
        ...newEvent
      });
      showPopup("Event created successfully!", "success");
      setShowEventModal(false);
      setNewEvent({
        title: "",
        description: "",
        event_date: "",
        location: "",
        meeting_link: ""
      });
      fetchEvents(selectedGroup.id);
    } catch (error) {
      showPopup(error.response?.data?.error || "Error creating event", "error");
    }
  };

  const toggleSidebar = () => {
    const newState = !sidebarOpen;
    setSidebarOpen(newState);
    localStorage.setItem("sidebarOpen", newState);
  };

  const openGroupDetail = (group) => {
    setSelectedGroup(group);
    setShowGroupDetailModal(true);
  };

  // Get available groups (groups user is not a member of)
  const availableGroups = groups.filter(g => !myGroups.some(mg => mg.id === g.id));

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
              <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem", animation: "bounce 2s ease-in-out infinite" }}>👥</div>
              <h3 style={{ color: theme.primary, fontSize: "1.1rem", fontWeight: 600 }}>Collaboration Hub</h3>
              <p style={{ color: theme.text, opacity: 0.7, fontSize: "0.7rem" }}>Study Together, Grow Together</p>
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
          {/* Header with Animation */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem", animation: "fadeInDown 0.5s ease-out" }}>
            <div>
              <h1 style={{ fontSize: "2rem", fontWeight: 700, color: theme.text, marginBottom: "0.5rem" }}>👥 Study Groups & Collaboration</h1>
              <p style={{ color: `${theme.text}CC`, fontSize: "0.9rem" }}>Connect with peers, share knowledge, and learn together</p>
            </div>
            <button onClick={() => setShowCreateModal(true)} style={{
              padding: "0.75rem 1.5rem", background: theme.gradient, border: "none", borderRadius: "12px",
              color: "white", cursor: "pointer", fontWeight: 600, transition: "all 0.3s ease", boxShadow: `0 4px 15px ${theme.primary}4D`
            }} onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 6px 20px ${theme.primary}4D`; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `0 4px 15px ${theme.primary}4D`; }}>
              ➕ Create New Group
            </button>
          </div>

          {/* Loading State */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "4rem", animation: "fadeIn 0.5s ease-out" }}>
              <div className="spinner" style={{ borderTopColor: theme.primary }}></div>
              <p style={{ color: theme.text, opacity: 0.7, marginTop: "1rem" }}>Loading groups...</p>
            </div>
          ) : (
            <>
              {/* My Groups Section */}
              <div style={{ marginBottom: "2.5rem", animation: "fadeInUp 0.5s ease-out" }}>
                <h2 style={{ color: theme.primary, marginBottom: "1rem", fontSize: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span>📌</span> My Groups ({myGroups.length})
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
                  {myGroups.map((group, idx) => (
                    <div key={group.id} onClick={() => openGroupDetail(group)} style={{
                      background: `linear-gradient(135deg, rgba(0,0,0,0.6), rgba(20,20,20,0.8))`,
                      borderRadius: "20px", padding: "1.5rem", border: `1px solid ${theme.primary}33`, cursor: "pointer",
                      transition: "all 0.3s ease", position: "relative", overflow: "hidden",
                      animation: `fadeInUp 0.5s ease-out ${idx * 0.05}s both`
                    }} onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-8px)"; e.currentTarget.style.boxShadow = `0 15px 35px rgba(0,0,0,0.3)`; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                      <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>{group.avatar || "👥"}</div>
                      <h3 style={{ color: "#fff", fontSize: "1.2rem", marginBottom: "0.25rem", fontWeight: 600 }}>{group.name}</h3>
                      <p style={{ color: theme.primary, fontSize: "0.8rem", marginBottom: "0.5rem", fontWeight: 500 }}>{group.subject}</p>
                      <p style={{ color: theme.text, opacity: 0.7, fontSize: "0.85rem", lineHeight: 1.4 }}>{group.description?.substring(0, 100)}...</p>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem" }}>
                        <span style={{ color: theme.text, opacity: 0.6, fontSize: "0.7rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                          👥 {group.member_count || 0} members
                        </span>
                        <button onClick={(e) => { e.stopPropagation(); leaveGroup(group.id); }} style={{
                          background: "rgba(220,53,69,0.15)", border: "1px solid rgba(220,53,69,0.5)", borderRadius: "8px",
                          padding: "0.3rem 0.8rem", color: "#dc3545", cursor: "pointer", fontSize: "0.7rem", transition: "all 0.3s ease"
                        }} onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(220,53,69,0.3)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(220,53,69,0.15)"; }}>
                          Leave
                        </button>
                      </div>
                    </div>
                  ))}
                  {myGroups.length === 0 && (
                    <div style={{ background: `linear-gradient(135deg, rgba(0,0,0,0.6), rgba(20,20,20,0.8))`, borderRadius: "20px", padding: "3rem", textAlign: "center", border: `1px solid ${theme.primary}33`, gridColumn: "1/-1" }}>
                      <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🤝</div>
                      <p style={{ color: theme.text, opacity: 0.7, fontSize: "1rem" }}>You haven't joined any groups yet.</p>
                      <p style={{ color: `${theme.text}99`, fontSize: "0.85rem", marginTop: "0.5rem" }}>Create a new group or join an existing one to start collaborating!</p>
                    </div>
                  )}
                </div>
              </div>

              {/* All Available Groups Section */}
              <div style={{ animation: "fadeInUp 0.6s ease-out" }}>
                <h2 style={{ color: theme.primary, marginBottom: "1rem", fontSize: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span>🌐</span> All Available Groups ({availableGroups.length})
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
                  {availableGroups.map((group, idx) => (
                    <div key={group.id} style={{
                      background: `linear-gradient(135deg, rgba(0,0,0,0.6), rgba(20,20,20,0.8))`,
                      borderRadius: "20px", padding: "1.5rem", border: `1px solid ${theme.primary}33`, transition: "all 0.3s ease",
                      animation: `fadeInUp 0.5s ease-out ${idx * 0.05}s both`
                    }} onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-8px)"; e.currentTarget.style.boxShadow = `0 15px 35px rgba(0,0,0,0.3)`; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                      <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>{group.avatar || "👥"}</div>
                      <h3 style={{ color: "#fff", fontSize: "1.2rem", marginBottom: "0.25rem", fontWeight: 600 }}>{group.name}</h3>
                      <p style={{ color: theme.primary, fontSize: "0.8rem", marginBottom: "0.5rem", fontWeight: 500 }}>{group.subject}</p>
                      <p style={{ color: theme.text, opacity: 0.7, fontSize: "0.85rem", lineHeight: 1.4 }}>{group.description?.substring(0, 100)}...</p>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem" }}>
                        <span style={{ color: theme.text, opacity: 0.6, fontSize: "0.7rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                          👥 {group.member_count || 0} members
                        </span>
                        <button onClick={() => { setSelectedGroup(group); setShowJoinModal(true); }} style={{
                          padding: "0.5rem 1rem", background: theme.gradient, border: "none", borderRadius: "8px",
                          color: "white", cursor: "pointer", fontSize: "0.8rem", fontWeight: 500, transition: "all 0.3s ease"
                        }} onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.05)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}>
                          Join Group
                        </button>
                      </div>
                    </div>
                  ))}
                  {availableGroups.length === 0 && (
                    <div style={{ background: `linear-gradient(135deg, rgba(0,0,0,0.6), rgba(20,20,20,0.8))`, borderRadius: "20px", padding: "3rem", textAlign: "center", border: `1px solid ${theme.primary}33`, gridColumn: "1/-1" }}>
                      <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🎉</div>
                      <p style={{ color: theme.text, opacity: 0.7, fontSize: "1rem" }}>No more groups available!</p>
                      <p style={{ color: `${theme.text}99`, fontSize: "0.85rem", marginTop: "0.5rem" }}>You've joined all available groups or no groups exist yet.</p>
                      <button onClick={() => setShowCreateModal(true)} style={{
                        marginTop: "1rem",
                        padding: "0.5rem 1rem",
                        background: theme.gradient,
                        border: "none",
                        borderRadius: "8px",
                        color: "white",
                        cursor: "pointer"
                      }}>Create New Group</button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div style={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ color: theme.primary, marginBottom: "1rem", fontSize: "1.5rem" }}>✨ Create New Study Group</h2>
            <input type="text" placeholder="📛 Group Name *" value={newGroup.name} onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
              style={{ width: "100%", padding: "0.85rem", marginBottom: "1rem", background: "rgba(255,255,255,0.05)", border: `1px solid ${theme.primary}4D`, borderRadius: "10px", color: "#fff", fontSize: "0.95rem", transition: "all 0.3s ease" }}
              onFocus={(e) => { e.currentTarget.style.borderColor = theme.primary; e.currentTarget.style.boxShadow = `0 0 0 3px ${theme.primary}1A`; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = `${theme.primary}4D`; e.currentTarget.style.boxShadow = "none"; }} />
            <input type="text" placeholder="📚 Subject *" value={newGroup.subject} onChange={(e) => setNewGroup({...newGroup, subject: e.target.value})}
              style={{ width: "100%", padding: "0.85rem", marginBottom: "1rem", background: "rgba(255,255,255,0.05)", border: `1px solid ${theme.primary}4D`, borderRadius: "10px", color: "#fff", fontSize: "0.95rem" }} />
            <textarea placeholder="📝 Description *" value={newGroup.description} onChange={(e) => setNewGroup({...newGroup, description: e.target.value})}
              rows="3" style={{ width: "100%", padding: "0.85rem", marginBottom: "1rem", background: "rgba(255,255,255,0.05)", border: `1px solid ${theme.primary}4D`, borderRadius: "10px", color: "#fff", fontSize: "0.95rem", resize: "vertical" }} />
            <input type="number" placeholder="👥 Max Members (default: 50)" value={newGroup.max_members} onChange={(e) => setNewGroup({...newGroup, max_members: parseInt(e.target.value)})}
              style={{ width: "100%", padding: "0.85rem", marginBottom: "1rem", background: "rgba(255,255,255,0.05)", border: `1px solid ${theme.primary}4D`, borderRadius: "10px", color: "#fff", fontSize: "0.95rem" }} />
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", color: theme.text, cursor: "pointer" }}>
              <input type="checkbox" checked={newGroup.is_private} onChange={(e) => setNewGroup({...newGroup, is_private: e.target.checked})} />
              🔒 Private Group (requires join code for access)
            </label>
            <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
              <button onClick={createGroup} style={{ flex: 1, padding: "0.85rem", background: theme.gradient, border: "none", borderRadius: "10px", color: "white", cursor: "pointer", fontWeight: 600, transition: "all 0.3s ease" }} onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"} onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}>Create Group</button>
              <button onClick={() => setShowCreateModal(false)} style={{ flex: 1, padding: "0.85rem", background: "rgba(108,117,125,0.2)", border: "1px solid #6c757d", borderRadius: "10px", color: "#a0a0a0", cursor: "pointer", transition: "all 0.3s ease" }} onMouseEnter={(e) => e.currentTarget.style.background = "rgba(108,117,125,0.3)"} onMouseLeave={(e) => e.currentTarget.style.background = "rgba(108,117,125,0.2)"}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Join Group Modal */}
      {showJoinModal && selectedGroup && (
        <div style={styles.modalOverlay} onClick={() => setShowJoinModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: "center", marginBottom: "1rem" }}>
              <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>{selectedGroup.avatar || "👥"}</div>
              <h2 style={{ color: theme.primary, fontSize: "1.3rem", marginBottom: "0.25rem" }}>Join {selectedGroup.name}</h2>
              <p style={{ color: `${theme.text}99`, fontSize: "0.85rem" }}>{selectedGroup.subject}</p>
            </div>
            {selectedGroup.is_private && (
              <input type="text" placeholder="🔑 Enter Join Code" value={joinCode} onChange={(e) => setJoinCode(e.target.value)}
                style={{ width: "100%", padding: "0.85rem", marginBottom: "1rem", background: "rgba(255,255,255,0.05)", border: `1px solid ${theme.primary}4D`, borderRadius: "10px", color: "#fff", fontSize: "0.95rem", textAlign: "center" }} />
            )}
            <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
              <button onClick={joinGroup} style={{ flex: 1, padding: "0.85rem", background: theme.gradient, border: "none", borderRadius: "10px", color: "white", cursor: "pointer", fontWeight: 600 }}>Join Group</button>
              <button onClick={() => { setShowJoinModal(false); setJoinCode(""); }} style={{ flex: 1, padding: "0.85rem", background: "rgba(108,117,125,0.2)", border: "1px solid #6c757d", borderRadius: "10px", color: "#a0a0a0", cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Popup Message */}
      {popupMessage.show && (
        <div style={{ position: "fixed", top: "20px", right: "20px", zIndex: 10001, animation: "slideInRight 0.3s ease-out" }}>
          <div style={{ background: popupMessage.type === "success" ? "linear-gradient(135deg, #28a745, #20c997)" : "linear-gradient(135deg, #dc3545, #c82333)", color: "white", padding: "1rem 1.5rem", borderRadius: "12px", display: "flex", alignItems: "center", gap: "0.75rem", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
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

export default StudyGroups;