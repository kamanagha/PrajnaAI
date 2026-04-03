import { useEffect, useState, useMemo } from "react";
import API from "../services/api";
import { useParams } from "react-router-dom";

function MaterialDetail() {
  const { id } = useParams();

  const [material, setMaterial] = useState(null);
  const [search, setSearch] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [progress, setProgress] = useState(0);

  // ✅ Fetch material
  useEffect(() => {
    API.get(`/materials/${id}/`)
      .then((res) => setMaterial(res.data))
      .catch((err) => console.error("Error:", err));
  }, [id]);

  // ✅ Reading progress
  useEffect(() => {
    const handleScroll = () => {
      const total =
        document.documentElement.scrollHeight - window.innerHeight;
      const current = window.scrollY;
      setProgress((current / total) * 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ✅ Safe content parsing
  const sections = useMemo(() => {
    if (!material) return [];

    try {
      if (typeof material.content === "object") {
        return material.content;
      }

      if (typeof material.content === "string") {
        const parsed = JSON.parse(material.content);
        if (Array.isArray(parsed)) return parsed;

        return [{ heading: "Content", content: material.content }];
      }

      return [];
    } catch {
      return [
        {
          heading: "Content",
          content: material?.content || "No content available"
        }
      ];
    }
  }, [material]);

  // ✅ Loading
  if (!material) {
    return (
      <div style={{ textAlign: "center", marginTop: "80px" }}>
        ⏳ Loading content...
      </div>
    );
  }

  // ✅ Detect images
  const isImage = (text) =>
    typeof text === "string" &&
    (text.match(/\.(jpeg|jpg|png|gif|webp)$/) || text.startsWith("http"));

  // ✅ Highlight search
  const highlight = (text) => {
    if (!search) return text;

    const regex = new RegExp(`(${search})`, "gi");
    return text.split(regex).map((part, i) =>
      part.toLowerCase() === search.toLowerCase() ? (
        <mark key={i} style={{ background: "#ffe066" }}>
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div
      style={{
        background: darkMode ? "#121212" : "#f8f9fb",
        minHeight: "100vh"
      }}
    >
      {/* 📊 Progress Bar */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "4px",
          width: `${progress}%`,
          background: "#007bff",
          zIndex: 999
        }}
      />

      <div
        style={{
          maxWidth: "800px",
          margin: "auto",
          padding: "40px 20px"
        }}
      >
        {/* 🔧 Controls */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "20px",
            flexWrap: "wrap"
          }}
        >
          <input
            type="text"
            placeholder="🔍 Search in notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: "8px",
              flex: 1,
              borderRadius: "6px",
              border: "1px solid #ccc"
            }}
          />

          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{ padding: "8px 12px", cursor: "pointer" }}
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>

        {/* 📌 Title */}
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "700",
            marginBottom: "5px",
            color: darkMode ? "#fff" : "#222"
          }}
        >
          {material.title}
        </h1>

        <p
          style={{
            color: darkMode ? "#aaa" : "#666",
            marginBottom: "30px"
          }}
        >
          {material.subject}
        </p>

        {/* 📄 Content */}
        {sections.map((sec, idx) => (
          <div key={idx} style={{ marginBottom: "40px" }}>
            <h2
              style={{
                color: "#007bff",
                marginBottom: "10px",
                fontSize: "20px"
              }}
            >
              {sec.heading || `Section ${idx + 1}`}
            </h2>

            {isImage(sec.content) ? (
              <img
                src={sec.content}
                alt=""
                style={{
                  width: "100%",
                  maxHeight: "450px",
                  objectFit: "contain",
                  borderRadius: "10px",
                  marginTop: "10px"
                }}
              />
            ) : (
              <div
                style={{
                  color: darkMode ? "#ddd" : "#333",
                  lineHeight: "1.8",
                  fontSize: "16px",
                  whiteSpace: "pre-wrap"
                }}
              >
                {highlight(sec.content)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default MaterialDetail;