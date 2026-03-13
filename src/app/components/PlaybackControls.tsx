import { useState, useEffect, useRef } from "react";
import { Play, Pause, Wand2, AudioWaveform } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Progress } from "@/app/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/components/ui/tooltip";

interface Note {
  frequency: number;
  start: number;
  duration: number;
}

interface PlaybackControlsProps {
  playbackMode: "original" | "edited";
  onPlaybackModeChange: (mode: "original" | "edited") => void;
  notes?: Note[];
  originalAudioUrl?: string;
}

export function PlaybackControls({
  playbackMode,
  onPlaybackModeChange,
  notes = [],
  originalAudioUrl,
}: PlaybackControlsProps) {

  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const stopRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioContextRef.current = new AudioContext();
  }, []);

  useEffect(() => {
    if (!isPlaying) {
      setPlaybackProgress(0);
      return;
    }

    const interval = setInterval(() => {
      setPlaybackProgress((prev) => Math.min(prev + 1, 100));
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const createVoiceSynth = (ctx: AudioContext, frequency: number, duration: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const formant1 = ctx.createBiquadFilter();
    const formant2 = ctx.createBiquadFilter();

    osc.type = "sawtooth";
    osc.frequency.value = frequency;

    formant1.type = "bandpass";
    formant1.frequency.value = 800;
    formant1.Q.value = 6;

    formant2.type = "bandpass";
    formant2.frequency.value = 1200;
    formant2.Q.value = 6;

    osc.connect(formant1);
    formant1.connect(formant2);
    formant2.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    // ADSR envelope
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.7, now + 0.03);   // attack
    gain.gain.linearRampToValueAtTime(0.5, now + 0.1);    // decay
    gain.gain.setValueAtTime(0.5, now + duration - 0.05); // sustain
    gain.gain.linearRampToValueAtTime(0, now + duration); // release

    osc.start(now);
    osc.stop(now + duration);
  };

  const playNotes = () => {
  if (!audioContextRef.current) return;

  const ctx = audioContextRef.current;
  const baseTime = ctx.currentTime;

  notes.forEach((note) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.value = note.frequency;

    osc.connect(gain);
    gain.connect(ctx.destination);

    const startTime = baseTime + note.start;
    const endTime = startTime + note.duration;

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.7, startTime + 0.03);
    gain.gain.setValueAtTime(0.6, endTime - 0.03);
    gain.gain.linearRampToValueAtTime(0, endTime);

    osc.start(startTime);
    osc.stop(endTime);
  });
};

  const playOriginal = () => {
    if (!originalAudioUrl) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(originalAudioUrl);
    }

    audioRef.current.currentTime = 0;
    audioRef.current.play();
  };

  const stopPlayback = () => {
    stopRef.current = true;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const togglePlayback = () => {
    if (isPlaying) {
      stopPlayback();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);

    if (playbackMode === "original") {
      playOriginal();
    } else {
      playNotes();
    }
  };

  return (
    <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl border border-zinc-700/50 p-6 md:p-8 space-y-5 shadow-2xl">

      <div>
        <h3 className="text-xl font-bold text-white mb-2">Playback & Preview</h3>
        <p className="text-sm text-gray-400">
          Listen to your audio with or without pitch adjustments
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">

        <Button
          size="lg"
          onClick={togglePlayback}
          className="gap-2 bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-black font-semibold shadow-lg shadow-green-500/30 border-none min-w-[140px]"
        >
          {isPlaying ? (
            <>
              <Pause className="size-5" />
              Pause
            </>
          ) : (
            <>
              <Play className="size-5" />
              Play Audio
            </>
          )}
        </Button>

        <div className="flex-1">
          <TooltipProvider>
            <Tabs
              value={playbackMode}
              onValueChange={(v) =>
                onPlaybackModeChange(v as "original" | "edited")
              }
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 h-auto p-1 bg-zinc-800 border border-zinc-700">

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <TabsTrigger
                        value="original"
                        className="gap-2 py-3 w-full data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-400"
                      >
                        <AudioWaveform className="size-4" />
                        Original
                      </TabsTrigger>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Listen to original recording</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <TabsTrigger
                        value="edited"
                        className="gap-2 py-3 w-full data-[state=active]:bg-purple-500 data-[state=active]:text-white text-gray-400"
                      >
                        <Wand2 className="size-4" />
                        Edited
                      </TabsTrigger>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Preview pitch-corrected version</p>
                  </TooltipContent>
                </Tooltip>

              </TabsList>
            </Tabs>
          </TooltipProvider>
        </div>

      </div>

      <div
        className={`p-4 rounded-xl border-2 ${
          playbackMode === "original"
            ? "bg-blue-500/10 border-blue-500/30"
            : "bg-purple-500/10 border-purple-500/30"
        }`}
      >
        <p className="text-base font-semibold mb-2">
          {playbackMode === "original"
            ? "🎵 Playing Original Audio"
            : "✨ Playing Synthesized Pitch"}
        </p>

        {isPlaying && (
          <Progress value={playbackProgress} className="h-2 bg-zinc-800" />
        )}
      </div>

    </div>
  );
}