import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

function App() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [review, setReview] = useState([]);
  const reviewEndRef = useRef(null);

  const handleReview = async () => {
    try {
      const res = await axios.post("http://localhost:5000/review", { code, language });
      if (res.data && res.data.review) {
        const lines = res.data.review.split("\n");
        setReview(lines);
      } else {
        setReview(["No review returned from Gemini."]);
      }
    } catch (err) {
      console.error("Error fetching review:", err);
      setReview([err.response?.data?.error || "Error fetching review."]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newCode = code.substring(0, start) + "    " + code.substring(end);
      setCode(newCode);
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 4;
      }, 0);
    }
  };

  const renderLineWithIcon = (line, index) => {
    const trimmed = line.trim().toLowerCase();
    let style = {
      color: "#ffffff",
      marginBottom: "4px",
      padding: "2px 4px",
      display: "block",
      background: index % 2 === 0 ? "#111111" : "#1a1a1a",
      borderRadius: "3px",
    };
    let icon = "";

    if (trimmed.startsWith("error") || trimmed.startsWith("problem") || trimmed.startsWith("issue")) {
      style.color = "#ff5555";
      icon = "❌ ";
    } else if (
      trimmed.startsWith("solution") ||
      trimmed.startsWith("fix") ||
      trimmed.startsWith("recommendation") ||
      trimmed.startsWith("improvement")
    ) {
      style.color = "#00ff00";
      icon = "✅ ";
    } else if (trimmed.startsWith("tip") || trimmed.startsWith("note")) {
      style.color = "#ffff55";
      icon = "💡 ";
    }

    return (
      <span style={style}>
        {icon}{line}
      </span>
    );
  };

  // Auto-scroll to bottom when review updates
  useEffect(() => {
    reviewEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [review]);

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "Arial, sans-serif", background: "#121212" }}>
      {/* Code Input */}
      <div style={{ flex: 1, padding: "20px", background: "#1e1e1e", color: "white" }}>
        <h2>Write your code</h2>
        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="python">Python</option>
          <option value="javascript">JavaScript</option>
          <option value="c">C</option>
          <option value="cpp">C++</option>
          <option value="java">Java</option>
        </select>
        <textarea
          style={{
            width: "100%",
            height: "75%",
            marginTop: "10px",
            background: "#2e2e2e",
            color: "white",
            fontFamily: "monospace",
            borderRadius: "5px",
            padding: "8px",
            resize: "none",
          }}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={handleReview}
          style={{
            marginTop: "10px",
            padding: "8px 12px",
            cursor: "pointer",
            borderRadius: "5px",
            background: "#4caf50",
            color: "#fff",
            border: "none",
          }}
        >
          Review Code
        </button>
      </div>

      {/* Gemini Review Output */}
      <div
        style={{
          flex: 1,
          padding: "20px",
          background: "#121212",
          color: "white",
          overflowY: "auto",
          lineHeight: "1.6",
          fontFamily: "monospace",
        }}
      >
        <h2>Code Review</h2>
        <div>
          {review.map((line, index) => (
            <React.Fragment key={index}>{renderLineWithIcon(line, index)}</React.Fragment>
          ))}
          <div ref={reviewEndRef} />
        </div>
      </div>
    </div>
  );
}

export default App;


const backendUrl = "https://code-reviewer-backend-v239.onrender.com";

const response = await fetch(`${backendUrl}/review`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ code, language }),
});
