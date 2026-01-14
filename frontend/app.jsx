import React from "react";
import { createRoot } from "react-dom/client";

function App() {
  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="logo">
          🎵 <span>VoiceCoach</span>
        </div>
        <nav className="nav">
          <a href="#">Help</a>
          <a href="#">Settings</a>
        </nav>
      </header>

      {/* Main */}
      <main className="main">
        <h1>Start Your Vocal Training</h1>
        <p className="subtitle">
          Upload or record your singing to get instant feedback and analysis
        </p>

        <div className="card-row">
          {/* Upload */}
          <div className="card">
            <div className="icon upload">⬆️</div>
            <h3>Upload Audio</h3>
            <p>Select an audio file of your singing (MP3, WAV, M4A)</p>
            <button className="primary">Choose File</button>
          </div>

          {/* Record */}
          <div className="card">
            <div className="icon record">🎙️</div>
            <h3>Record Live</h3>
            <p>Record your voice directly using your microphone</p>
            <button className="secondary">Start Recording</button>
          </div>
        </div>

        {/* Tips */}
        <div className="tips">
          <h4>💡 Tips for Best Results</h4>
          <ul>
            <li>Record in a quiet environment with minimal background noise</li>
            <li>Sing clearly and confidently, staying close to your microphone</li>
            <li>Upload files with a single vocal track for accurate analysis</li>
          </ul>
        </div>
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
