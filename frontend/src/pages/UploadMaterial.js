import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { useTheme } from "../context/ThemeContext";

function UploadMaterial() {
  const navigate = useNavigate();
  const { currentTheme, themes } = useTheme();
  const theme = themes[currentTheme];
  
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError] = useState("");
  const [titleError, setTitleError] = useState("");
  const [subjectError, setSubjectError] = useState("");
  const [popupMessage, setPopupMessage] = useState({ show: false, message: "", type: "" });
  const [selectedFileType, setSelectedFileType] = useState("");
  const [preview, setPreview] = useState(null);
  
  const fileInputRef = useRef(null);

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

  // File validation
  const validateFile = (selectedFile) => {
    if (!selectedFile) return false;
    
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'image/jpeg',
      'image/png',
      'image/jpg'
    ];
    
    const maxSize = 50 * 1024 * 1024; // 50MB
    
    if (!allowedTypes.includes(selectedFile.type)) {
      setFileError("Invalid file type. Please upload PDF, DOC, TXT, PPT, or Image files.");
      return false;
    }
    
    if (selectedFile.size > maxSize) {
      setFileError("File is too large. Maximum size is 50MB.");
      return false;
    }
    
    setFileError("");
    return true;
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (validateFile(selectedFile)) {
      setFile(selectedFile);
      setSelectedFileType(getFileTypeIcon(selectedFile.type));
      
      // Create preview for images
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target.result);
        reader.readAsDataURL(selectedFile);
      } else {
        setPreview(null);
      }
    } else {
      setFile(null);
      setPreview(null);
    }
  };

  const getFileTypeIcon = (fileType) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word')) return '📝';
    if (fileType.includes('text')) return '📘';
    if (fileType.includes('powerpoint')) return '📊';
    if (fileType.includes('image')) return '🖼️';
    return '📁';
  };

  const getFileTypeName = (fileType) => {
    if (fileType.includes('pdf')) return 'PDF Document';
    if (fileType.includes('word')) return 'Word Document';
    if (fileType.includes('text')) return 'Text File';
    if (fileType.includes('powerpoint')) return 'PowerPoint Presentation';
    if (fileType.includes('image')) return 'Image';
    return 'Document';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (validateFile(droppedFile)) {
      setFile(droppedFile);
      setSelectedFileType(getFileTypeIcon(droppedFile.type));
      
      if (droppedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target.result);
        reader.readAsDataURL(droppedFile);
      } else {
        setPreview(null);
      }
    }
  };

  const validateForm = () => {
    let isValid = true;
    
    if (!title.trim()) {
      setTitleError("Title is required");
      isValid = false;
    } else if (title.length < 3) {
      setTitleError("Title must be at least 3 characters");
      isValid = false;
    } else {
      setTitleError("");
    }
    
    if (!subject.trim()) {
      setSubjectError("Subject is required");
      isValid = false;
    } else {
      setSubjectError("");
    }
    
    if (!file) {
      setFileError("Please select a file to upload");
      isValid = false;
    }
    
    return isValid;
  };

  const upload = async () => {
    if (!validateForm()) {
      showPopup("Please fix the errors before uploading", "error");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("subject", subject);
    if (description) formData.append("description", description);
    if (tags) formData.append("tags", tags);

    try {
      setLoading(true);
      setUploadProgress(0);
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);
      
      // Send request with JWT token in API
      const res = await API.post("/materials/upload/", formData);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        setLoading(false);
        showPopup(res.data?.message || "Material uploaded successfully! ✅", "success");
        
        // Redirect to View Materials page after 1.5 seconds
        setTimeout(() => {
          navigate("/materials");
        }, 1500);
      }, 500);
      
    } catch (err) {
      setLoading(false);
      setUploadProgress(0);
      console.error("Upload Error:", err.response);
      
      const errorMsg = err.response?.data?.error || "Upload failed. Please try again. ❌";
      showPopup(errorMsg, "error");
    }
  };

  const clearForm = () => {
    setTitle("");
    setSubject("");
    setDescription("");
    setTags("");
    setFile(null);
    setPreview(null);
    setSelectedFileType("");
    setFileError("");
    setTitleError("");
    setSubjectError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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
    formCard: {
      background: "linear-gradient(135deg, rgba(0,0,0,0.6), rgba(20,20,20,0.8))",
      borderRadius: "20px",
      padding: "2rem",
      border: `1px solid ${theme.primary}33`,
      boxShadow: `0 20px 40px rgba(0,0,0,0.3)`,
      transition: "all 0.3s ease"
    },
    label: {
      display: "block",
      color: theme.primary,
      marginBottom: "0.5rem",
      fontSize: "0.9rem",
      fontWeight: 500
    },
    input: (hasError) => ({
      width: "100%",
      padding: "0.9rem 1rem",
      background: "rgba(255, 255, 255, 0.05)",
      border: hasError ? "1px solid #dc3545" : `1px solid ${theme.primary}4D`,
      borderRadius: "12px",
      color: "#ffffff",
      fontSize: "1rem",
      transition: "all 0.3s ease",
      outline: "none"
    }),
    textarea: {
      width: "100%",
      padding: "0.9rem 1rem",
      background: "rgba(255, 255, 255, 0.05)",
      border: `1px solid ${theme.primary}4D`,
      borderRadius: "12px",
      color: "#ffffff",
      fontSize: "1rem",
      transition: "all 0.3s ease",
      outline: "none",
      resize: "vertical",
      fontFamily: "inherit"
    },
    dropzone: (isDragActive) => ({
      border: isDragActive ? `2px dashed ${theme.primary}` : `2px dashed ${theme.primary}4D`,
      borderRadius: "12px",
      padding: "2rem",
      textAlign: "center",
      background: isDragActive ? `${theme.primary}1A` : "rgba(255, 255, 255, 0.02)",
      transition: "all 0.3s ease",
      cursor: "pointer"
    }),
    uploadButton: {
      flex: 2,
      padding: "0.9rem",
      background: theme.gradient,
      color: "white",
      border: "none",
      borderRadius: "12px",
      fontSize: "1rem",
      fontWeight: 600,
      transition: "all 0.3s ease",
      cursor: "pointer"
    },
    clearButton: {
      flex: 1,
      padding: "0.9rem",
      background: "rgba(108, 117, 125, 0.2)",
      border: `1px solid ${theme.primary}4D`,
      borderRadius: "12px",
      color: theme.text,
      transition: "all 0.3s ease",
      cursor: "pointer"
    }
  };

  return (
    <div style={styles.container}>
      {/* Popup Notification - Fixed position below navbar */}
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

      {/* Decorative background */}
      <div style={{
        position: "fixed",
        top: "20%",
        left: "-10%",
        width: "500px",
        height: "500px",
        background: `radial-gradient(circle, ${theme.primary}14 0%, transparent 70%)`,
        borderRadius: "50%",
        filter: "blur(80px)",
        pointerEvents: "none"
      }}></div>
      <div style={{
        position: "fixed",
        bottom: "10%",
        right: "-5%",
        width: "400px",
        height: "400px",
        background: `radial-gradient(circle, ${theme.primary}0D 0%, transparent 70%)`,
        borderRadius: "50%",
        filter: "blur(80px)",
        pointerEvents: "none"
      }}></div>

      <div style={{
        maxWidth: "800px",
        margin: "0 auto",
        position: "relative",
        zIndex: 2
      }}>
        {/* Header */}
        <div style={{
          textAlign: "center",
          marginBottom: "2rem"
        }}>
          <div style={{
            fontSize: "3rem",
            marginBottom: "0.5rem",
            animation: "bounce 2s ease-in-out infinite"
          }}>📤</div>
          <h1 style={{
            fontSize: "2rem",
            fontWeight: 800,
            color: theme.text,
            marginBottom: "0.5rem"
          }}>
            Upload Study Material
          </h1>
          <p style={{
            color: `${theme.text}CC`,
            fontSize: "0.95rem"
          }}>
            Share your knowledge by uploading study resources
          </p>
        </div>

        {/* Upload Form */}
        <div style={styles.formCard}>
          {/* Title Input */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={styles.label}>
              Title <span style={{ color: "#dc3545" }}>*</span>
            </label>
            <input
              type="text"
              placeholder="Enter material title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={styles.input(!!titleError)}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = theme.primary;
                e.currentTarget.style.boxShadow = `0 0 0 3px ${theme.primary}1A`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = titleError ? "#dc3545" : `${theme.primary}4D`;
                e.currentTarget.style.boxShadow = "none";
              }}
            />
            {titleError && (
              <p style={{ color: "#dc3545", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                ⚠️ {titleError}
              </p>
            )}
          </div>

          {/* Subject Input */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={styles.label}>
              Subject <span style={{ color: "#dc3545" }}>*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Mathematics, Physics, History"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              style={styles.input(!!subjectError)}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = theme.primary;
                e.currentTarget.style.boxShadow = `0 0 0 3px ${theme.primary}1A`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = subjectError ? "#dc3545" : `${theme.primary}4D`;
                e.currentTarget.style.boxShadow = "none";
              }}
            />
            {subjectError && (
              <p style={{ color: "#dc3545", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                ⚠️ {subjectError}
              </p>
            )}
          </div>

          {/* Description Input (Optional) */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={styles.label}>
              Description (Optional)
            </label>
            <textarea
              placeholder="Add a brief description of your material..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              style={styles.textarea}
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

          {/* Tags Input (Optional) */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={styles.label}>
              Tags (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g., notes, exam-prep, chapter-1 (comma separated)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              style={styles.input(false)}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = theme.primary;
                e.currentTarget.style.boxShadow = `0 0 0 3px ${theme.primary}1A`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = `${theme.primary}4D`;
                e.currentTarget.style.boxShadow = "none";
              }}
            />
            <p style={{ color: `${theme.text}99`, fontSize: "0.7rem", marginTop: "0.25rem" }}>
              💡 Add tags to make your material easier to find
            </p>
          </div>

          {/* File Upload Area */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={styles.label}>
              File <span style={{ color: "#dc3545" }}>*</span>
            </label>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              style={styles.dropzone(dragActive)}
              onClick={() => fileInputRef.current.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                style={{ display: "none" }}
                accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.jpg,.jpeg,.png"
              />
              
              {!file ? (
                <>
                  <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>📁</div>
                  <p style={{ color: theme.primary, marginBottom: "0.5rem" }}>
                    Drag & drop your file here or click to browse
                  </p>
                  <p style={{ color: `${theme.text}99`, fontSize: "0.8rem" }}>
                    Supported formats: PDF, DOC, DOCX, TXT, PPT, PPTX, JPG, PNG (Max 50MB)
                  </p>
                </>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                  <div style={{ fontSize: "2rem" }}>{selectedFileType}</div>
                  <div style={{ textAlign: "left" }}>
                    <p style={{ color: "#ffffff", fontWeight: 500, marginBottom: "0.25rem" }}>
                      {file.name}
                    </p>
                    <p style={{ color: `${theme.text}99`, fontSize: "0.8rem" }}>
                      {getFileTypeName(file.type)} • {formatFileSize(file.size)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setPreview(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    style={{
                      background: "rgba(220, 53, 69, 0.2)",
                      border: "1px solid #dc3545",
                      borderRadius: "8px",
                      padding: "0.25rem 0.5rem",
                      color: "#dc3545",
                      cursor: "pointer"
                    }}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
            
            {/* Image Preview */}
            if (preview && (
              <div style={{ marginTop: "1rem", textAlign: "center" }}>
                <img src={preview} alt="Preview" style={{
                  maxWidth: "200px",
                  maxHeight: "200px",
                  borderRadius: "8px",
                  border: `1px solid ${theme.primary}4D`
                }} />
              </div>
            )
            
            {fileError && (
              <p style={{ color: "#dc3545", fontSize: "0.75rem", marginTop: "0.5rem" }}>
                ⚠️ {fileError}
              </p>
            )}
          </div>

          {/* Upload Progress */}
          {loading && (
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "0.5rem"
              }}>
                <span style={{ color: theme.primary, fontSize: "0.85rem" }}>Uploading...</span>
                <span style={{ color: theme.primary, fontSize: "0.85rem" }}>{uploadProgress}%</span>
              </div>
              <div style={{
                width: "100%",
                height: "8px",
                background: "rgba(255, 255, 255, 0.1)",
                borderRadius: "4px",
                overflow: "hidden"
              }}>
                <div style={{
                  width: `${uploadProgress}%`,
                  height: "100%",
                  background: theme.gradient,
                  transition: "width 0.3s ease",
                  borderRadius: "4px"
                }}></div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
            <button
              onClick={upload}
              disabled={loading}
              style={{
                ...styles.uploadButton,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer"
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = `0 6px 20px ${theme.primary}4D`;
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }
              }}
            >
              {loading ? "Uploading..." : "📤 Upload Material"}
            </button>
            
            <button
              onClick={clearForm}
              disabled={loading}
              style={{
                ...styles.clearButton,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer"
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = `${theme.primary}1A`;
                  e.currentTarget.style.transform = "translateY(-2px)";
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = "rgba(108, 117, 125, 0.2)";
                  e.currentTarget.style.transform = "translateY(0)";
                }
              }}
            >
              Clear
            </button>
          </div>
        </div>

        {/* Tips Card */}
        <div style={{
          marginTop: "2rem",
          background: "rgba(0, 0, 0, 0.3)",
          borderRadius: "12px",
          padding: "1rem",
          border: `1px solid ${theme.primary}1A`
        }}>
          <h4 style={{
            color: theme.primary,
            fontSize: "0.9rem",
            marginBottom: "0.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}>
            💡 Pro Tips
          </h4>
          <ul style={{ color: `${theme.text}CC`, fontSize: "0.8rem", margin: 0, paddingLeft: "1.2rem" }}>
            <li>Use clear and descriptive titles for better organization</li>
            <li>Add relevant tags to help others discover your content</li>
            <li>Supported files: PDF, DOC, DOCX, TXT, PPT, PPTX, Images (Max 50MB)</li>
            <li>Your uploaded materials will be visible to all users</li>
          </ul>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
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
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
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
      `}</style>
    </div>
  );
}

export default UploadMaterial;