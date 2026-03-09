import { useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";

interface SingAlongSectionProps {
  onRecordingChange?: (isRecording: boolean) => void;
}

export function SingAlongSection({ onRecordingChange }: SingAlongSectionProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [micPermission, setMicPermission] = useState<"granted" | "denied" | "prompt">("prompt");
  const [feedback, setFeedback] = useState<"low" | "high" | "good" | null>(null);

  const toggleRecording = async () => {
    if (!isRecording) {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicPermission("granted");
        setIsRecording(true);
        onRecordingChange?.(true);
        
        // Simulate feedback changes
        const feedbackOptions: ("low" | "high" | "good")[] = ["low", "high", "good"];
        const interval = setInterval(() => {
          setFeedback(feedbackOptions[Math.floor(Math.random() * feedbackOptions.length)]);
        }, 2000);
        
        return () => clearInterval(interval);
      } catch (error) {
        setMicPermission("denied");
      }
    } else {
      setIsRecording(false);
      setFeedback(null);
      onRecordingChange?.(false);
    }
  };

  const getFeedbackStyle = () => {
    switch (feedback) {
      case "low":
        return "bg-orange-500/10 text-orange-400 border-orange-500/30 backdrop-blur-sm";
      case "high":
        return "bg-orange-500/10 text-orange-400 border-orange-500/30 backdrop-blur-sm";
      case "good":
        return "bg-green-500/10 text-green-400 border-green-500/30 backdrop-blur-sm";
      default:
        return "bg-zinc-800/50 text-gray-400 border-zinc-700/50 backdrop-blur-sm";
    }
  };

  const getFeedbackText = () => {
    switch (feedback) {
      case "low":
        return "Try lifting your pitch slightly";
      case "high":
        return "Lower your pitch a bit";
      case "good":
        return "Great job staying on note! 🎵";
      default:
        return "Start singing to get feedback";
    }
  };

  return (
    <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl border border-zinc-700/50 p-6 md:p-8 space-y-5 shadow-2xl">
      <div>
        <h3 className="text-xl font-bold text-white mb-2">Sing Along</h3>
        <p className="text-sm text-gray-400">
          Click the microphone to start recording your voice
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Button
          size="lg"
          onClick={toggleRecording}
          className={`gap-2 w-full sm:w-auto font-semibold shadow-lg border-none ${
            isRecording
              ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-red-500/30"
              : "bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-black shadow-green-500/30"
          }`}
        >
          {isRecording ? (
            <>
              <MicOff className="size-5" />
              Stop Recording
            </>
          ) : (
            <>
              <Mic className="size-5" />
              Start Recording
            </>
          )}
        </Button>

        {micPermission === "granted" && (
          <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30 backdrop-blur-sm">
            Microphone ready
          </Badge>
        )}
        {micPermission === "denied" && (
          <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30 backdrop-blur-sm">
            Microphone access denied
          </Badge>
        )}
      </div>

      {/* Real-time feedback */}
      <div
        className={`p-5 rounded-xl border-2 transition-all ${getFeedbackStyle()}`}
      >
        <p className="text-base font-semibold text-center">{getFeedbackText()}</p>
      </div>

      {/* Encouraging hints */}
      {isRecording && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 backdrop-blur-sm">
          <p className="text-sm text-blue-300">
            💡 <strong className="text-blue-400">Tip:</strong> Focus on matching the green reference line. Take your time and breathe!
          </p>
        </div>
      )}
    </div>
  );
}