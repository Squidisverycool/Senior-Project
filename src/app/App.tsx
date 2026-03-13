import { useState, useEffect, useRef, useMemo } from "react";
import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";
import { AudioUploadSection } from "@/app/components/AudioUploadSection";
import { PitchVisualization } from "@/app/components/PitchVisualization";
import { PitchControls } from "@/app/components/PitchControls";
import { PlaybackControls } from "@/app/components/PlaybackControls";
import { SingAlongSection } from "@/app/components/SingAlongSection";
import { ArrowDown, Mic } from "lucide-react";
import { NoteTableEditor } from "@/app/components/NoteTableEditor";
import { Note } from "@/app/components/NoteTableEditor";
import { mockNotes } from "@/mock/mockNotes";

export default function App() {
  const [curveMode, setCurveMode] = useState<"discrete" | "curved">("discrete");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [snapToNote, setSnapToNote] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isNoteTableOpen, setIsNoteTableOpen] = useState(true);
  const [playbackMode, setPlaybackMode] =
    useState<"original" | "edited">("original");

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

  // Convert notes into playback format
  const playbackNotes = useMemo(() => {
  if (!notes.length) return [];

  const firstStart = notes[0].start;

  return notes.map((note) => ({
    frequency: 440 * Math.pow(2, (note.midi - 69) / 12),
    start: note.start - firstStart,
    duration: note.end - note.start,
  }));
}, [notes]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-black">
      <Header />

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6 md:space-y-8">
        {/* Step 1 */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="step-badge">1</div>
            <h2 className="text-2xl font-bold text-white">
              Upload Your Song
            </h2>
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

              <PitchVisualization
                notes={notes}
                isRecording={isRecording}
                curveMode={curveMode}
              />

              <div className="mt-6 border border-zinc-700 rounded-xl overflow-hidden bg-zinc-900/50">
                <button
                  onClick={() => setIsNoteTableOpen(!isNoteTableOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold"
                >
                  <span>Note Table Editor</span>
                  <ArrowDown
                    className={`size-5 transition-transform duration-300 ${
                      isNoteTableOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isNoteTableOpen && (
                  <div className="p-4">
                    <NoteTableEditor
                      notes={notes}
                      onChange={setNotes}
                    />
                  </div>
                )}
              </div>

              <div className="mt-4">
                <PitchControls
                  snapToNote={snapToNote}
                  onSnapToggle={setSnapToNote}
                  onPitchAdjust={handlePitchAdjust}
                  onReset={handleReset}
                />
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
                  Preview & Compare
                </h2>
              </div>
              <PlaybackControls
                playbackMode={playbackMode}
                onPlaybackModeChange={setPlaybackMode}
                notes={playbackNotes}
              />
            </section>

            <div className="flex justify-center">
              <ArrowDown className="size-6 text-green-500 animate-bounce" />
            </div>

            {/* Step 4 */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="step-badge">4</div>
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
