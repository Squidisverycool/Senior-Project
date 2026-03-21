import { useState, useEffect, useRef, useMemo } from "react";
import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";
import { AudioUploadSection } from "@/app/components/AudioUploadSection";
import { PitchVisualization } from "@/app/components/PitchVisualization";
import { PitchControls } from "@/app/components/PitchControls";
import { PlaybackControls } from "@/app/components/PlaybackControls";
import { SingAlongSection } from "@/app/components/SingAlongSection";
import { ArrowDown, SlidersHorizontal, Music2 } from "lucide-react";
import { NoteTableEditor, Note } from "@/app/components/NoteTableEditor";
import { mockNotes } from "@/mock/mockNotes";

export default function App() {
  const [curveMode, setCurveMode] = useState<"discrete" | "curved">("discrete");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [snapToNote, setSnapToNote] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [playbackMode, setPlaybackMode] = useState<"original" | "edited">("original");
  const [activePanel, setActivePanel] = useState<"none" | "notes" | "playback">("none");

  const visualizationRef = useRef<HTMLElement>(null);

  const handleFileUploaded = (file: File) => {
    setUploadedFile(file);
    setNotes(mockNotes.notes);
  };

  useEffect(() => {
    if (uploadedFile && visualizationRef.current) {
      setTimeout(() => {
        visualizationRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 500);
    }
  }, [uploadedFile]);

  const handlePitchAdjust = (halfSteps: number) => {
    console.log("Adjust pitch by", halfSteps, "half steps");
  };

  const handleReset = () => {
    console.log("Reset pitch adjustments");
  };

  const pitchCurve = useMemo(() => {
    if (!notes.length) return [];
    const firstStart = notes[0].start;
    return notes.flatMap((note) => {
      const start = note.start - firstStart;
      const end = note.end - firstStart;
      const frequency = 440 * Math.pow(2, (note.midi - 69) / 12);
      return [
        { time: start, frequency },
        { time: end, frequency },
      ];
    });
  }, [notes]);

  const playbackNotes = useMemo(() => {
    if (!notes.length) return [];
    const firstStart = notes[0].start;
    return notes.map((note) => ({
      frequency: 440 * Math.pow(2, (note.midi - 69) / 12),
      start: note.start - firstStart,
      duration: note.end - note.start,
    }));
  }, [notes]);

  const togglePanel = (panel: "notes" | "playback") => {
    setActivePanel((prev) => (prev === panel ? "none" : panel));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-black">
      <Header />

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6 md:space-y-8">
        {/* Step 1 */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="step-badge">1</div>
            <h2 className="text-2xl font-bold text-white">Upload Your Song</h2>
          </div>
          <AudioUploadSection onFileUploaded={handleFileUploaded} />
        </section>

        {uploadedFile && (
          <>
            <div className="flex justify-center">
              <ArrowDown className="size-6 text-green-500 animate-bounce" />
            </div>

            {/* Step 2 */}
            <section ref={visualizationRef}>
              <div className="flex items-center gap-3 mb-4">
                <div className="step-badge">2</div>
                <h2 className="text-2xl font-bold text-white">
                  Visualize & Adjust Pitch
                </h2>
              </div>

              <div className="relative rounded-xl overflow-hidden">
                <PitchVisualization
                  notes={notes}
                  isRecording={isRecording}
                  curveMode={curveMode}
                />

                {/* Floating toolbar */}
                <div className="absolute bottom-4 right-4 flex gap-2 z-10">
                  <button
                    onClick={() => togglePanel("playback")}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all shadow-lg ${
                      activePanel === "playback"
                        ? "bg-green-500 text-black"
                        : "bg-zinc-800/90 text-white hover:bg-zinc-700"
                    }`}
                  >
                    <Music2 className="size-4" />
                    Preview
                  </button>
                  <button
                    onClick={() => togglePanel("notes")}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all shadow-lg ${
                      activePanel === "notes"
                        ? "bg-green-500 text-black"
                        : "bg-zinc-800/90 text-white hover:bg-zinc-700"
                    }`}
                  >
                    <SlidersHorizontal className="size-4" />
                    Notes
                  </button>
                </div>

                {/* Slide-up panel */}
                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden bg-zinc-900 border-t border-zinc-700 ${
                    activePanel !== "none"
                      ? "max-h-[500px] opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  {activePanel === "playback" && (
                    <div className="p-4">
                      <PlaybackControls
                        playbackMode={playbackMode}
                        onPlaybackModeChange={setPlaybackMode}
                        pitchCurve={pitchCurve}
                      />
                      <div className="mt-4">
                        <PitchControls
                          snapToNote={snapToNote}
                          onSnapToggle={setSnapToNote}
                          onPitchAdjust={handlePitchAdjust}
                          onReset={handleReset}
                        />
                      </div>
                    </div>
                  )}

                  {activePanel === "notes" && (
                    <div className="p-4">
                      <NoteTableEditor notes={notes} onChange={setNotes} />
                    </div>
                  )}
                </div>
              </div>
            </section>

            <div className="flex justify-center">
              <ArrowDown className="size-6 text-green-500 animate-bounce" />
            </div>

            {/* Step 3 */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="step-badge">3</div>
                <h2 className="text-2xl font-bold text-white">
                  Practice & Record
                </h2>
              </div>
              <SingAlongSection onRecordingChange={setIsRecording} />
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}