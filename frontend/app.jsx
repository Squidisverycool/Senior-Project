import React, { useState } from "react";
import { createRoot } from "react-dom/client";

function App() {
  /* ===============================
     STATE (TOP OF COMPONENT)
  =============================== */
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  /* ===============================
     EVENT HANDLER (LOGIC)
  =============================== */
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/analyze", {
        method: "POST",
        body: formData
      });

      if (!res.ok) throw new Error("Analysis failed");

      const data = await res.json();
      setResult(data);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     UI (JSX)
  =============================== */
  return (
    <div className="app">
      <h1>VoiceCoach</h1>

      {/* Upload */}
      <input
        type="file"
        accept="audio/*"
        onChange={handleUpload}
      />

      {/* Loading */}
      {loading && <p>Analyzing audio… 🎧</p>}

      {/* Results */}
      {result && (
        <div className="results">
          <h2>Analysis Result</h2>

          {/* Pitch Plot */}
          <img
            src={`/file?path=${result.pitch_plot}`}
            alt="Pitch plot"
            style={{ width: "100%", marginBottom: "16px" }}
          />

          {/* Resynth Audio */}
          <audio controls>
            <source
              src={`/file?path=${result.resynth_path}`}
              type="audio/wav"
            />
          </audio>

          {/* Notes JSON (temporary) */}
          <pre>
            {JSON.stringify(result.notes, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
