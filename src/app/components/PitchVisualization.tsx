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
import { BarChart2, Music2 } from "lucide-react";

interface Props {
  notes?: Note[];
  isRecording: boolean;
  curveMode?: "discrete" | "curved";
}

const NOTE_TO_VALUE: Record<string, number> = {
  C3: 0,  D3: 2,  E3: 4,  F3: 5,  G3: 7,  A3: 9,  B3: 11,
  C4: 12, D4: 14, E4: 16, F4: 17, G4: 19, A4: 21, B4: 23,
  C5: 24, D5: 26, E5: 28, F5: 29, G5: 31,
};

type Mode = "analytic" | "musical";

export function PitchVisualization({ notes = [], isRecording }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>("musical"); // CHANGED: default is now musical

  const pitchCurve = useMemo(() => {
    if (!notes.length) return [];

    const pts: { time: number; pitch: number }[] = [];

    if (mode === "analytic") {
      const step = 0.05;
      const glideTime = 0.1;

      for (let i = 0; i < notes.length; i++) {
        const note = notes[i];
        const pitch = NOTE_TO_VALUE[note.note_name] ?? 12;
        const start = note.start;
        const end = note.end;
        const prevPitch =
          i > 0 ? NOTE_TO_VALUE[notes[i - 1].note_name] ?? pitch : pitch;
        const hasChange = prevPitch !== pitch;

        for (let t = start; t <= end; t += step) {
          let finalPitch = pitch;
          if (hasChange && t < start + glideTime) {
            const ratio = (t - start) / glideTime;
            finalPitch = prevPitch + (pitch - prevPitch) * ratio;
          }
          pts.push({ time: t, pitch: finalPitch });
        }
      }
    }

    if (mode === "musical") {
      for (let i = 0; i < notes.length; i++) {
        const note = notes[i];
        const pitch = NOTE_TO_VALUE[note.note_name] ?? 12;
        const center = (note.start + note.end) / 2;
        pts.push({ time: center, pitch });
      }
    }

    return pts;
  }, [notes, mode]);

  const maxTime = useMemo(() => {
    return notes.length ? Math.max(...notes.map((n) => n.end)) : 10;
  }, [notes]);

  const [domain, setDomain] = useState<[number, number]>([0, maxTime]);

  useEffect(() => {
    setDomain([0, maxTime]);
  }, [maxTime]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const wheelHandler = (e: WheelEvent) => {
      e.preventDefault();

      const rect = element.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const width = rect.width;

      setDomain((prevDomain) => {
        const [start, end] = prevDomain;
        const range = end - start;
        const cursorRatio = mouseX / width;
        const cursorTime = start + range * cursorRatio;
        const zoomSpeed = 0.2;
        const direction = e.deltaY > 0 ? 1 : -1;
        const newRangeRaw = range * (1 + direction * zoomSpeed);
        const MIN_RANGE = 0.3;
        const MAX_RANGE = maxTime;
        const newRange = Math.min(Math.max(newRangeRaw, MIN_RANGE), MAX_RANGE);

        let newStart = cursorTime - cursorRatio * newRange;
        let newEnd = newStart + newRange;

        if (newStart < 0) { newStart = 0; newEnd = newRange; }
        if (newEnd > maxTime) { newEnd = maxTime; newStart = maxTime - newRange; }

        return [newStart, newEnd];
      });
    };

    element.addEventListener("wheel", wheelHandler, { passive: false });
    return () => element.removeEventListener("wheel", wheelHandler);
  }, [maxTime]);

  const resetZoom = () => setDomain([0, maxTime]);

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

      {/* Top-right toolbar — zoom + mode toggle side by side */}
      <div className="absolute top-3 right-5 flex items-center gap-2">
        <span className="text-xs text-zinc-400">
          {(maxTime / (domain[1] - domain[0])).toFixed(2)}x
        </span>
        <button
          onClick={() =>
            setMode((prev) => (prev === "analytic" ? "musical" : "analytic"))
          }
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-lg ${
            mode === "musical"
              ? "bg-green-500 text-black"
              : "bg-zinc-800/90 text-white hover:bg-zinc-700"
          }`}
        >
          {mode === "musical" ? (
            <Music2 className="size-3" />
          ) : (
            <BarChart2 className="size-3" />
          )}
          {mode === "musical" ? "Musical" : "Analytic"}
        </button>
      </div>
    </div>
  );
}