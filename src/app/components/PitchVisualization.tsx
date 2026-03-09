import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Note } from "@/app/components/NoteTableEditor";
import { useState, useRef, useMemo, useEffect } from "react";

interface Props {
  notes?: Note[];
  isRecording: boolean;
}

const NOTE_TO_VALUE: Record<string, number> = {
  C3: 0, D3: 2, E3: 4, F3: 5, G3: 7, A3: 9, B3: 11,
  C4: 12, D4: 14, E4: 16, F4: 17, G4: 19, A4: 21, B4: 23,
  C5: 24, D5: 26, E5: 28, F5: 29, G5: 31,
};

type Mode = "analytic" | "musical";

export function PitchVisualization({ notes = [], isRecording }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>("analytic");

  // ======================================
  // Build Pitch Curve
  // ======================================
  const pitchCurve = useMemo(() => {
    if (!notes.length) return [];

    const pts: { time: number; pitch: number }[] = [];

    // ---------------------------
    // 🎯 ANALYTIC MODE
    // ---------------------------
    if (mode === "analytic") {
      const step = 0.05;
      const glideTime = 0.1; // short transition region

      for (let i = 0; i < notes.length; i++) {
        const note = notes[i];
        const pitch = NOTE_TO_VALUE[note.note_name] ?? 12;

        const start = note.start;
        const end = note.end;

        const prevPitch =
          i > 0
            ? NOTE_TO_VALUE[notes[i - 1].note_name] ?? pitch
            : pitch;

        const hasChange = prevPitch !== pitch;

        for (let t = start; t <= end; t += step) {
          let finalPitch = pitch;

          // Only glide at beginning if pitch changed
          if (hasChange && t < start + glideTime) {
            const ratio = (t - start) / glideTime;
            finalPitch =
              prevPitch + (pitch - prevPitch) * ratio;
          }

          pts.push({ time: t, pitch: finalPitch });
        }
      }
    }

    // ---------------------------
    // 🎵 MUSICAL MODE
    // ---------------------------
    if (mode === "musical") {
      for (let i = 0; i < notes.length; i++) {
        const note = notes[i];
        const pitch = NOTE_TO_VALUE[note.note_name] ?? 12;
        const center = (note.start + note.end) / 2;

        pts.push({
          time: center,
          pitch: pitch,
        });
      }
    }

    return pts;
  }, [notes, mode]);

  const maxTime = useMemo(() => {
    return notes.length
      ? Math.max(...notes.map(n => n.end))
      : 10;
  }, [notes]);

  const [domain, setDomain] = useState<[number, number]>([0, maxTime]);

  useEffect(() => {
    setDomain([0, maxTime]);
  }, [maxTime]);

  // ======================================
  // Scroll Zoom
  // ======================================
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const wheelHandler = (e: WheelEvent) => {
      e.preventDefault();

      const rect = element.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const width = rect.width;

      setDomain(prevDomain => {
        const [start, end] = prevDomain;
        const range = end - start;

        const cursorRatio = mouseX / width;
        const cursorTime = start + range * cursorRatio;

        const zoomSpeed = 0.2;
        const direction = e.deltaY > 0 ? 1 : -1;

        const newRangeRaw = range * (1 + direction * zoomSpeed);

        const MIN_RANGE = 0.3;
        const MAX_RANGE = maxTime;

        const newRange = Math.min(
          Math.max(newRangeRaw, MIN_RANGE),
          MAX_RANGE
        );

        let newStart = cursorTime - cursorRatio * newRange;
        let newEnd = newStart + newRange;

        if (newStart < 0) {
          newStart = 0;
          newEnd = newRange;
        }

        if (newEnd > maxTime) {
          newEnd = maxTime;
          newStart = maxTime - newRange;
        }

        return [newStart, newEnd];
      });
    };

    element.addEventListener("wheel", wheelHandler, { passive: false });

    return () => {
      element.removeEventListener("wheel", wheelHandler);
    };
  }, [maxTime]);

  const resetZoom = () => {
    setDomain([0, maxTime]);
  };

  // ======================================
  // Render
  // ======================================
  return (
    <div
      ref={containerRef}
      className="h-[400px] rounded-xl border border-zinc-700 bg-zinc-900 p-4 cursor-crosshair relative"
      onDoubleClick={resetZoom}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={pitchCurve}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            type="number"
            domain={domain}
            allowDataOverflow
            scale="linear"
          />
          <YAxis />
          <Tooltip />
          <Line
            type={mode === "musical" ? "monotone" : "linear"}
            dataKey="pitch"
            stroke="#22c55e"
            strokeWidth={3}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Zoom indicator */}
      <div className="absolute top-3 right-5 text-xs text-zinc-400">
        Zoom: {(maxTime / (domain[1] - domain[0])).toFixed(2)}x
      </div>

      {/* Mode toggle */}
      <button
        onClick={() =>
          setMode(prev =>
            prev === "analytic" ? "musical" : "analytic"
          )
        }
        className="absolute bottom-3 right-5 text-xs bg-zinc-800 hover:bg-zinc-700 px-3 py-1 rounded-md border border-zinc-600"
      >
        Mode: {mode}
      </button>
    </div>
  );
}