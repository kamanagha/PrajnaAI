import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { useTheme } from "../context/ThemeContext";

const Chatbot = () => {
  const { currentTheme, themes } = useTheme();
  const theme = themes[currentTheme];
  
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("chatHistory");
    return saved ? JSON.parse(saved) : [
      {
        id: 1,
        text: "🔥 Welcome to PrajnaAI! I'm your intelligent learning assistant. Here's what I can do for you:\n\n✨ **Features:**\n• 📚 Smart Material Search\n• 💡 Concept Explanations\n• 📝 Study Plan Generator\n• 🎯 Quiz & Assessment\n• 🔍 Resource Recommendations\n• 💬 24/7 Instant Support\n\n**How can I supercharge your learning today?** 🚀",
        sender: "bot",
        timestamp: new Date().toISOString(),
        isTyping: false,
      },
    ];
  });
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Quick actions for users
  const quickActions = [
    { icon: "📚", label: "Find Materials", action: "Find study materials for" },
    { icon: "💡", label: "Explain Concept", action: "Can you explain" },
    { icon: "📝", label: "Study Plan", action: "Create a study plan for" },
    { icon: "🎯", label: "Quiz Me", action: "Create a quiz about" },
    { icon: "🔍", label: "Summarize", action: "Summarize this topic:" },
    { icon: "📊", label: "Compare", action: "Compare and contrast" },
    { icon: "💪", label: "Motivation", action: "Give me motivation to study" },
    { icon: "⏰", label: "Time Management", action: "Tips for time management" },
  ];

  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(messages));
    const storedName = localStorage.getItem("userName");
    const storedEmail = localStorage.getItem("userEmail");
    if (storedName) setUserName(storedName);
    if (storedEmail) setUserEmail(storedEmail);
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  // Advanced AI Response System
  const getAIResponse = async (message) => {
    const msg = message.toLowerCase();
    
    if (userName && (msg.includes("hello") || msg.includes("hi") || msg.includes("hey"))) {
      return `Hello ${userName}! 👋 Great to see you again! How can I help you with your learning journey today? 🚀`;
    }
    
    if (msg.includes("study plan") || msg.includes("study schedule")) {
      const topic = message.replace(/study plan|schedule for/i, '').trim();
      if (topic) {
        return generateStudyPlan(topic);
      }
      return "📅 I'll help you create a personalized study plan! Please tell me:\n\n• What subject/topic you want to study\n• Your available time per day\n• Your deadline or goal\n\nFor example: 'Create a study plan for JavaScript in 2 weeks'";
    }
    
    if (msg.includes("quiz") || msg.includes("test me") || msg.includes("exam me")) {
      const topic = message.replace(/quiz|test me|exam me on/i, '').trim();
      if (topic) {
        return generateQuiz(topic);
      }
      return "🎯 Ready for a quiz! Tell me what topic you want to be tested on.\n\nExample: 'Quiz me on React hooks' or 'Create a quiz about World War II'";
    }
    
    if (msg.includes("summarize") || msg.includes("summary")) {
      return "📄 I can help summarize content! Please:\n\n1. Paste the text you want summarized\n2. Or share a topic to summarize\n3. Or upload a document (PDF/TXT)\n\nI'll provide a clear, concise summary with key points! ✨";
    }
    
    if (msg.includes("explain") || msg.includes("what is") || msg.includes("define")) {
      const concept = message.replace(/explain|what is|define|tell me about/i, '').trim();
      if (concept) {
        return explainConcept(concept);
      }
      return "💡 I'd love to explain any concept! Just ask me:\n\n• 'Explain quantum computing'\n• 'What is machine learning?'\n• 'Define photosynthesis'\n\nI'll provide clear explanations with examples! 📚";
    }
    
    if (msg.includes("code") || msg.includes("programming") || msg.includes("function") || msg.includes("debug")) {
      return getCodeHelp(message);
    }
    
    if (msg.includes("find material") || msg.includes("search for") || msg.includes("looking for")) {
      const searchTerm = message.replace(/find material|search for|looking for/i, '').trim();
      if (searchTerm) {
        return searchMaterials(searchTerm);
      }
      return "🔍 I can help you find the best study materials! Tell me what subject or topic you're interested in.\n\nExample: 'Find materials for Data Science' or 'Looking for Calculus resources'";
    }
    
    if (msg.includes("compare") || msg.includes("difference between")) {
      return generateComparison(message);
    }
    
    if (msg.includes("motivation") || msg.includes("inspire") || msg.includes("encourage")) {
      return getMotivationalMessage();
    }
    
    if (msg.includes("time management") || msg.includes("productivity") || msg.includes("focus")) {
      return getTimeManagementTips();
    }
    
    if (msg.includes("career") || msg.includes("job") || msg.includes("interview")) {
      return getCareerGuidance(message);
    }
    
    if (msg.includes("solve") && (msg.includes("math") || msg.includes("equation") || msg.includes("problem"))) {
      return "🧮 I can help solve math problems! Please share the equation or problem, and I'll provide step-by-step solution.\n\nExample: 'Solve x^2 + 5x + 6 = 0'";
    }
    
    if (msg.includes("recommend") || msg.includes("suggest") || msg.includes("best resource")) {
      return getResourceRecommendations(message);
    }
    
    return getDefaultResponse(message);
  };

  const generateStudyPlan = (topic) => {
    return `📅 **Personalized Study Plan for ${topic.toUpperCase()}**\n\n
**Week 1 - Foundation** 📖
• Days 1-2: Basic concepts and terminology
• Days 3-4: Core principles and fundamentals
• Days 5-7: Practice exercises and examples

**Week 2 - Deep Dive** 🎯
• Days 8-9: Advanced topics and applications
• Days 10-11: Problem-solving sessions
• Days 12-14: Projects and real-world examples

**Week 3 - Mastery** 💪
• Days 15-17: Review and revision
• Days 18-19: Mock tests and assessments
• Days 20-21: Final practice and Q&A

Would you like me to adjust this plan based on your availability? 🎓`;
  };

  const generateQuiz = (topic) => {
    return `🎯 **Quick Quiz: ${topic.toUpperCase()}**\n\n
**Question 1:** What is the fundamental concept of ${topic}?
A) Basic principle
B) Advanced theory
C) Practical application
D) Historical context

**Question 2:** How does ${topic} apply in real-world scenarios?
A) Theoretical only
B) Practical applications
C) Both A and B
D) Neither

**Question 3:** What's the most important aspect of learning ${topic}?
A) Memorization
B) Understanding concepts
C) Practice
D) All of the above

Want me to provide answers with explanations? 📝`;
  };

  const explainConcept = (concept) => {
    return `💡 **Understanding ${concept}**\n\n
**Simple Explanation:** 
Let me break down ${concept} in an easy-to-understand way...

**Key Points:**
• Core idea: Fundamental concept
• Why it matters: Real-world importance
• Common examples: Practical applications

Would you like me to go deeper into any specific aspect? 🎓`;
  };

  const getCodeHelp = (message) => {
    return `💻 **Code Assistance**\n\n
I can help you with:
• Debugging errors 🐛
• Code optimization ⚡
• Algorithm explanations 📊
• Best practices 📝

**To get the best help:**
1. Share your code snippet
2. Describe the issue
3. Mention the programming language

Share your code, and I'll provide detailed assistance! 🚀`;
  };

  const searchMaterials = (topic) => {
    return `🔍 **Materials found for "${topic}"**\n\n
**Recommended Resources:**

📚 **Books & Textbooks:**
• "Complete Guide to ${topic}" - Beginner to Advanced
• "Mastering ${topic}" - Practical approach

🎥 **Video Courses:**
• Interactive tutorials (20+ hours)
• Project-based learning series

📄 **Study Materials:**
• Lecture notes and summaries
• Practice problems with solutions

Want me to find specific types of materials? 🎯`;
  };

  const generateComparison = (message) => {
    return `📊 **Comparison Analysis**\n\n
I can help you compare different concepts!

**To provide the best comparison:**
1. Specify what you want to compare
2. Mention the aspects to focus on

What would you like to compare? 🔄`;
  };

  const getMotivationalMessage = () => {
    const quotes = [
      "🌟 **You've got this!** Every expert was once a beginner. Keep going! 💪",
      "📚 **Small progress is still progress.** One page, one concept, one step at a time! 🚀",
      "💡 **Learning is a journey, not a race.** Enjoy the process of discovering new things! ✨",
      "🎯 **Your future self will thank you** for the effort you put in today! 🌈",
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  };

  const getTimeManagementTips = () => {
    return `⏰ **Time Management & Productivity Tips**\n\n
**The Pomodoro Technique** 🍅
• Study for 25 minutes
• Take 5-minute breaks
• Repeat 4 times, then take longer break

**Effective Strategies:**
✅ **2-Minute Rule:** Do it immediately if it takes <2 minutes
✅ **Eat That Frog:** Do hardest task first
✅ **Time Blocking:** Schedule specific study blocks

Want personalized time management strategies? 🎯`;
  };

  const getCareerGuidance = (message) => {
    return `💼 **Career Guidance**\n\n
I can help you with:
• **Career paths** in different fields 🛤️
• **Skill requirements** for specific jobs 📋
• **Interview preparation** tips 🎯

What specific career advice are you looking for? 🚀`;
  };

  const getResourceRecommendations = (message) => {
    return `📚 **Resource Recommendations**\n\n
**Best Learning Platforms:**
• **Coursera** - University-level courses
• **edX** - Professional certifications
• **Khan Academy** - Free comprehensive learning

**Practice Platforms:**
• **LeetCode** - Coding challenges
• **Kaggle** - Data science

Want more specific recommendations for your field? 🎯`;
  };

  const getDefaultResponse = (message) => {
    return `🤔 Thanks for your question! I want to help you better.\n\n**Here's what I can assist with:**\n\n📚 **Learning Support**\n• Find and recommend study materials\n• Explain difficult concepts simply\n• Create personalized study plans\n• Generate practice quizzes\n\n💡 **Smart Features**\n• Summarize long texts\n• Compare different topics\n• Solve problems step-by-step\n• Provide coding assistance\n\n**Try asking me:**\n→ "Create a study plan for [topic]"\n→ "Explain [concept] with examples"\n→ "Quiz me on [subject]"\n→ "Find materials for [topic]"\n\nHow can I help you today? 🚀`;
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage("");
    setIsTyping(true);
    setShowSuggestions(false);

    setTimeout(async () => {
      const aiResponseText = await getAIResponse(currentMessage);
      
      const aiMessage = {
        id: Date.now() + 1,
        text: aiResponseText,
        sender: "bot",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 800);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        text: "🧹 Chat cleared! I'm still here to help. What would you like to learn today? 🚀",
        sender: "bot",
        timestamp: new Date().toISOString(),
      },
    ]);
    localStorage.removeItem("chatHistory");
    setShowSuggestions(true);
  };

  const sendSuggestion = (suggestion) => {
    setInputMessage(suggestion);
    setTimeout(() => sendMessage(), 100);
  };

  const sendQuickAction = (action) => {
    setInputMessage(action);
    setTimeout(() => sendMessage(), 100);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const exportChat = () => {
    const chatData = messages.map(m => `${m.sender.toUpperCase()}: ${m.text}\n[${formatTime(m.timestamp)}]`).join('\n\n');
    const blob = new Blob([chatData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prajnaai-chat-${new Date().toISOString()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Styles with theme integration
  const styles = {
    floatingButton: {
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 9999,
    },
    button: {
      position: 'relative',
      background: theme.gradient,
      border: 'none',
      borderRadius: '50%',
      width: '60px',
      height: '60px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      boxShadow: `0 10px 30px ${theme.primary}80`,
      transition: 'all 0.3s ease',
      color: 'white',
    },
    notificationBadge: {
      position: 'absolute',
      top: '-4px',
      right: '-4px',
      backgroundColor: theme.accent,
      color: 'white',
      fontSize: '12px',
      fontWeight: 'bold',
      borderRadius: '50%',
      width: '22px',
      height: '22px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    backdrop: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      zIndex: 9998,
      transition: 'opacity 0.3s ease',
    },
    chatWindow: {
      position: 'fixed',
      bottom: '96px',
      right: '24px',
      width: '450px',
      maxWidth: 'calc(100vw - 48px)',
      height: '650px',
      maxHeight: 'calc(100vh - 120px)',
      backgroundColor: theme.background,
      borderRadius: '20px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      border: `2px solid ${theme.primary}`,
      zIndex: 9999,
      animation: 'slideUp 0.3s ease-out',
    },
    header: {
      background: 'linear-gradient(135deg, #000000, #1a1a1a)',
      color: theme.primary,
      padding: '16px',
      borderBottom: `2px solid ${theme.primary}`,
    },
    headerContent: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    avatarContainer: {
      position: 'relative',
    },
    avatar: {
      width: '45px',
      height: '45px',
      background: theme.gradient,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    onlineStatus: {
      position: 'absolute',
      bottom: '2px',
      right: '2px',
      width: '12px',
      height: '12px',
      backgroundColor: '#00FF00',
      borderRadius: '50%',
      border: '2px solid #000000',
    },
    headerText: {
      marginLeft: '8px',
    },
    title: {
      fontWeight: 'bold',
      fontSize: '18px',
      margin: 0,
      color: theme.primary,
    },
    subtitle: {
      fontSize: '11px',
      margin: '4px 0 0 0',
      color: theme.text,
      opacity: 0.8,
    },
    headerButtons: {
      display: 'flex',
      gap: '8px',
    },
    iconButton: {
      background: 'rgba(255, 107, 0, 0.2)',
      border: 'none',
      color: theme.primary,
      cursor: 'pointer',
      padding: '6px',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease',
    },
    messagesArea: {
      flex: 1,
      overflowY: 'auto',
      padding: '16px',
      backgroundColor: theme.background,
    },
    messageWrapper: (sender) => ({
      display: 'flex',
      marginBottom: '16px',
      justifyContent: sender === 'user' ? 'flex-end' : 'flex-start',
      animation: 'fadeIn 0.3s ease-out',
    }),
    botAvatar: {
      flexShrink: 0,
      marginRight: '8px',
    },
    botAvatarCircle: {
      width: '35px',
      height: '35px',
      background: theme.gradient,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    messageBubble: (sender) => ({
      maxWidth: '75%',
      padding: '12px',
      borderRadius: '18px',
      backgroundColor: sender === 'user' ? theme.primary : theme.surface,
      color: sender === 'user' ? 'white' : theme.text,
      boxShadow: sender === 'user' ? `0 2px 5px ${theme.primary}80` : '0 1px 3px rgba(0, 0, 0, 0.3)',
      border: sender === 'user' ? 'none' : `1px solid ${theme.primary}`,
    }),
    messageText: {
      fontSize: '14px',
      lineHeight: '1.6',
      whiteSpace: 'pre-wrap',
    },
    timestamp: (sender) => ({
      fontSize: '10px',
      marginTop: '6px',
      color: sender === 'user' ? '#FFD699' : theme.text,
      opacity: 0.7,
    }),
    userAvatar: {
      flexShrink: 0,
      marginLeft: '8px',
    },
    userAvatarCircle: {
      width: '35px',
      height: '35px',
      backgroundColor: theme.primary,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    typingIndicator: {
      display: 'flex',
      justifyContent: 'flex-start',
      marginBottom: '16px',
      animation: 'fadeIn 0.3s ease-out',
    },
    typingBubble: {
      backgroundColor: theme.surface,
      border: `1px solid ${theme.primary}`,
      borderRadius: '18px',
      padding: '12px',
    },
    typingDots: {
      display: 'flex',
      gap: '4px',
    },
    dot: (delay) => ({
      width: '8px',
      height: '8px',
      backgroundColor: theme.primary,
      borderRadius: '50%',
      animation: `bounce 1.4s infinite ${delay}`,
    }),
    quickActionsArea: {
      padding: '12px',
      backgroundColor: theme.background,
      borderTop: `1px solid ${theme.primary}`,
      borderBottom: `1px solid ${theme.primary}`,
    },
    quickActionsTitle: {
      fontSize: '11px',
      color: theme.primary,
      marginBottom: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
    },
    quickActionsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '8px',
    },
    quickActionButton: {
      fontSize: '11px',
      backgroundColor: theme.surface,
      border: `1px solid ${theme.primary}`,
      borderRadius: '8px',
      padding: '6px',
      color: theme.text,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '4px',
    },
    suggestionsArea: {
      padding: '12px',
      backgroundColor: theme.background,
      borderTop: `1px solid ${theme.primary}`,
    },
    suggestionsTitle: {
      fontSize: '11px',
      color: theme.primary,
      marginBottom: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
    },
    suggestionsContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
    },
    suggestionButton: {
      fontSize: '11px',
      backgroundColor: theme.surface,
      border: `1px solid ${theme.primary}`,
      borderRadius: '20px',
      padding: '6px 12px',
      color: theme.text,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    inputArea: {
      borderTop: `2px solid ${theme.primary}`,
      padding: '16px',
      backgroundColor: theme.background,
    },
    inputContainer: {
      display: 'flex',
      gap: '10px',
    },
    textareaWrapper: {
      flex: 1,
      position: 'relative',
    },
    textarea: {
      width: '100%',
      backgroundColor: theme.surface,
      border: `1px solid ${theme.primary}`,
      borderRadius: '12px',
      padding: '10px',
      paddingRight: '40px',
      fontSize: '13px',
      fontFamily: 'inherit',
      resize: 'none',
      color: theme.text,
      transition: 'all 0.2s ease',
    },
    sendButton: {
      background: theme.gradient,
      border: 'none',
      borderRadius: '12px',
      padding: '10px 20px',
      color: 'white',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease',
      fontWeight: 'bold',
    },
    footerText: {
      fontSize: '9px',
      color: theme.primary,
      marginTop: '10px',
      textAlign: 'center',
      opacity: 0.7,
    },
    svgIcon: {
      width: '22px',
      height: '22px',
    },
  };

  return (
    <>
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-3px);
          }
        }
        
        button:hover {
          transform: scale(1.05) !important;
        }
        
        textarea:focus {
          outline: none;
          border-color: ${theme.primary};
          box-shadow: 0 0 0 3px ${theme.primary}33;
        }
        
        ::-webkit-scrollbar {
          width: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: ${theme.surface};
        }
        
        ::-webkit-scrollbar-thumb {
          background: ${theme.primary};
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: ${theme.secondary};
        }
      `}</style>

      {/* Floating Chat Button */}
      <div style={styles.floatingButton}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={styles.button}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          {isOpen ? (
            <svg style={styles.svgIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg style={styles.svgIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          )}
        </button>
        
        {!isOpen && messages.length > 1 && (
          <div style={styles.notificationBadge}>
            {messages.length}
          </div>
        )}
      </div>

      {/* Chat Modal */}
      {isOpen && (
        <>
          <div style={styles.backdrop} onClick={() => setIsOpen(false)} />
          
          <div style={styles.chatWindow}>
            {/* Header */}
            <div style={styles.header}>
              <div style={styles.headerContent}>
                <div style={styles.headerLeft}>
                  <div style={styles.avatarContainer}>
                    <div style={styles.avatar}>
                      <svg style={{...styles.svgIcon, width: '25px', height: '25px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div style={styles.onlineStatus}></div>
                  </div>
                  <div style={styles.headerText}>
                    <h3 style={styles.title}>PrajnaAI Assistant</h3>
                    <p style={styles.subtitle}>🔥 Online • Ready to Learn</p>
                  </div>
                </div>
                <div style={styles.headerButtons}>
                  <button
                    onClick={exportChat}
                    style={styles.iconButton}
                    title="Export chat"
                  >
                    <svg style={{width: '18px', height: '18px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                  <button
                    onClick={clearChat}
                    style={styles.iconButton}
                    title="Clear chat"
                  >
                    <svg style={{width: '18px', height: '18px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    style={styles.iconButton}
                  >
                    <svg style={{width: '18px', height: '18px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            {showQuickActions && messages.length < 2 && (
              <div style={styles.quickActionsArea}>
                <div style={styles.quickActionsTitle}>
                  <span>⚡</span> Quick Actions
                </div>
                <div style={styles.quickActionsGrid}>
                  {quickActions.slice(0, 8).map((action, index) => (
                    <button
                      key={index}
                      onClick={() => sendQuickAction(action.action + " ")}
                      style={styles.quickActionButton}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = theme.primary;
                        e.currentTarget.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = theme.surface;
                        e.currentTarget.style.color = theme.text;
                      }}
                    >
                      <span style={{fontSize: '16px'}}>{action.icon}</span>
                      <span>{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages Area */}
            <div style={styles.messagesArea}>
              {messages.map((message) => (
                <div key={message.id} style={styles.messageWrapper(message.sender)}>
                  {message.sender === "bot" && (
                    <div style={styles.botAvatar}>
                      <div style={styles.botAvatarCircle}>
                        <svg style={{width: '18px', height: '18px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                    </div>
                  )}
                  <div style={styles.messageBubble(message.sender)}>
                    <div style={styles.messageText}>
                      <ReactMarkdown>{message.text}</ReactMarkdown>
                    </div>
                    <div style={styles.timestamp(message.sender)}>
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                  {message.sender === "user" && (
                    <div style={styles.userAvatar}>
                      <div style={styles.userAvatarCircle}>
                        <svg style={{width: '18px', height: '18px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div style={styles.typingIndicator}>
                  <div style={styles.botAvatar}>
                    <div style={styles.botAvatarCircle}>
                      <svg style={{width: '18px', height: '18px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                  </div>
                  <div style={styles.typingBubble}>
                    <div style={styles.typingDots}>
                      <div style={styles.dot('0s')}></div>
                      <div style={styles.dot('0.2s')}></div>
                      <div style={styles.dot('0.4s')}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {showSuggestions && messages.length < 3 && (
              <div style={styles.suggestionsArea}>
                <div style={styles.suggestionsTitle}>
                  <span>💡</span> Try these questions:
                </div>
                <div style={styles.suggestionsContainer}>
                  <button
                    onClick={() => sendSuggestion("Create a study plan for Web Development")}
                    style={styles.suggestionButton}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = theme.primary;
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = theme.surface;
                      e.currentTarget.style.color = theme.text;
                    }}
                  >
                    📚 Create study plan
                  </button>
                  <button
                    onClick={() => sendSuggestion("Explain Artificial Intelligence with examples")}
                    style={styles.suggestionButton}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = theme.primary;
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = theme.surface;
                      e.currentTarget.style.color = theme.text;
                    }}
                  >
                    🤖 Explain AI
                  </button>
                  <button
                    onClick={() => sendSuggestion("Quiz me on JavaScript fundamentals")}
                    style={styles.suggestionButton}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = theme.primary;
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = theme.surface;
                      e.currentTarget.style.color = theme.text;
                    }}
                  >
                    📝 Take a quiz
                  </button>
                  <button
                    onClick={() => sendSuggestion("Find materials for Data Science")}
                    style={styles.suggestionButton}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = theme.primary;
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = theme.surface;
                      e.currentTarget.style.color = theme.text;
                    }}
                  >
                    🔍 Find materials
                  </button>
                </div>
              </div>
            )}

            {/* Input Area */}
            <div style={styles.inputArea}>
              <div style={styles.inputContainer}>
                <div style={styles.textareaWrapper}>
                  <textarea
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about learning... 🚀"
                    style={styles.textarea}
                    rows="2"
                  />
                </div>
                <button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim()}
                  style={{
                    ...styles.sendButton,
                    ...(!inputMessage.trim() && { opacity: 0.5, cursor: 'not-allowed' })
                  }}
                  onMouseEnter={(e) => {
                    if (inputMessage.trim()) {
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  Send 🚀
                </button>
              </div>
              <div style={styles.footerText}>
                🔥 Powered by PrajnaAI • Your Ultimate Learning Companion
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Chatbot;