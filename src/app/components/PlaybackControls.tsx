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

interface PitchPoint {
  time: number
  frequency: number
}

interface PlaybackControlsProps {
  playbackMode: "original" | "edited";
  onPlaybackModeChange: (mode: "original" | "edited") => void;
  pitchCurve?: PitchPoint[];
  originalAudioUrl?: string;
}

export function PlaybackControls({
  playbackMode,
  onPlaybackModeChange,
  pitchCurve = [],
  originalAudioUrl,
}: PlaybackControlsProps) {

  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackProgress, setPlaybackProgress] = useState(0)

  const audioContextRef = useRef<AudioContext | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const playheadStartRef = useRef(0)
  const animationRef = useRef<number>()

  const oscRef = useRef<OscillatorNode | null>(null)

  useEffect(() => {
    audioContextRef.current = new AudioContext()
  }, [])

  const getTotalDuration = () => {
    if (!pitchCurve.length) return 0

    return Math.max(...pitchCurve.map(p => p.time))
  }


  const updatePlayhead = () => {

    const total = getTotalDuration()
    if (!total) return

    const elapsed =
      audioContextRef.current!.currentTime - playheadStartRef.current

    const progress = Math.min((elapsed / total) * 100, 100)

    setPlaybackProgress(progress)

    if (progress < 100) {
      animationRef.current = requestAnimationFrame(updatePlayhead)
    } else {
      setIsPlaying(false)
    }
  }

  const playPitchCurve = async () => {

    if (!audioContextRef.current || !pitchCurve.length) return

    const ctx = audioContextRef.current
    await ctx.resume()

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = "sawtooth"

    osc.connect(gain)
    gain.connect(ctx.destination)

    oscRef.current = osc

    const baseTime = ctx.currentTime

    playheadStartRef.current = baseTime

    pitchCurve.forEach((point, i) => {

      const t = baseTime + point.time

      if (i === 0) {
        osc.frequency.setValueAtTime(point.frequency, t)
      } else {
        osc.frequency.linearRampToValueAtTime(point.frequency, t)
      }

    })

    const endTime = baseTime + getTotalDuration()

    gain.gain.setValueAtTime(0, baseTime)
    gain.gain.linearRampToValueAtTime(0.7, baseTime + 0.03)
    gain.gain.setValueAtTime(0.6, endTime - 0.05)
    gain.gain.linearRampToValueAtTime(0, endTime)

    osc.start(baseTime)
    osc.stop(endTime + 0.1)

    animationRef.current = requestAnimationFrame(updatePlayhead)
    console.log("pitchCurve", pitchCurve)

  }

  const playOriginal = () => {

    if (!originalAudioUrl) return

    if (!audioRef.current) {
      audioRef.current = new Audio(originalAudioUrl)
    }

    audioRef.current.currentTime = 0
    audioRef.current.play()
  }

  const stopPlayback = () => {

    setIsPlaying(false)

    cancelAnimationFrame(animationRef.current!)

    if (oscRef.current) {
      oscRef.current.stop()
      oscRef.current = null
    }

    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }

  const togglePlayback = () => {

    if (isPlaying) {
      stopPlayback()
      return
    }

    setIsPlaying(true)

    if (playbackMode === "original") {
      playOriginal()
    } else {
      playPitchCurve()
    }
  }

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
  )
}
