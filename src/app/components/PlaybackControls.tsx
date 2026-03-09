import { useState, useEffect } from "react";
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

interface PlaybackControlsProps {
  playbackMode: "original" | "edited";
  onPlaybackModeChange: (mode: "original" | "edited") => void;
}

export function PlaybackControls({
  playbackMode,
  onPlaybackModeChange,
}: PlaybackControlsProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setPlaybackProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 2;
        });
      }, 100);
      return () => clearInterval(interval);
    } else {
      setPlaybackProgress(0);
    }
  }, [isPlaying]);

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
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
        {/* Play/Pause Button */}
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

        {/* Playback Mode Selector */}
        <div className="flex-1">
          <TooltipProvider>
            <Tabs
              value={playbackMode}
              onValueChange={(value) => onPlaybackModeChange(value as "original" | "edited")}
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
                        <span className="hidden sm:inline">Original Voice</span>
                        <span className="sm:hidden">Original</span>
                      </TabsTrigger>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Listen to the original recording</p>
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
                        <span className="hidden sm:inline">Edited Pitch</span>
                        <span className="sm:hidden">Edited</span>
                      </TabsTrigger>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Listen to how your edits would sound</p>
                  </TooltipContent>
                </Tooltip>
              </TabsList>
            </Tabs>
          </TooltipProvider>
        </div>
      </div>

      {/* Mode description */}
      <div className={`p-4 rounded-xl border-2 transition-all ${
        playbackMode === "original"
          ? "bg-blue-500/10 border-blue-500/30 backdrop-blur-sm"
          : "bg-purple-500/10 border-purple-500/30 backdrop-blur-sm"
      }`}>
        <p className="text-base font-semibold mb-2">
          {playbackMode === "original" ? (
            <span className="text-blue-400">🎵 Playing Original Audio</span>
          ) : (
            <span className="text-purple-400">✨ Playing Edited Version (Resynthesized)</span>
          )}
        </p>
        <p className="text-sm text-gray-300 mb-3">
          {playbackMode === "original"
            ? "You're hearing the unmodified recording as it was uploaded"
            : "This is a preview of your pitch adjustments applied to the audio"}
        </p>
        {isPlaying && (
          <Progress value={playbackProgress} className="h-2 bg-zinc-800" />
        )}
      </div>
    </div>
  );
}