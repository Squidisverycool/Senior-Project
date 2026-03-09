import { Slider } from "@/app/components/ui/slider";
import { Switch } from "@/app/components/ui/switch";
import { Label } from "@/app/components/ui/label";

interface RhythmControlsProps {
  tempo: number;
  practiceMode: boolean;
  onTempoChange: (value: number[]) => void;
  onPracticeModeToggle: (checked: boolean) => void;
}

export function RhythmControls({
  tempo,
  practiceMode,
  onTempoChange,
  onPracticeModeToggle,
}: RhythmControlsProps) {
  return (
    <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl border border-zinc-700/50 p-6 md:p-8 space-y-6 shadow-2xl">
      <div>
        <div className="flex items-center justify-between mb-4">
          <Label className="text-base font-semibold text-white">Tempo Adjustment</Label>
          <span className="text-lg text-green-400 font-mono font-bold">{tempo}%</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-400 w-12">Slow</span>
          <Slider
            value={[tempo]}
            onValueChange={onTempoChange}
            min={50}
            max={150}
            step={5}
            className="flex-1"
          />
          <span className="text-xs text-gray-400 w-16 text-right">Fast</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
        <div>
          <Label htmlFor="practice-mode" className="cursor-pointer font-semibold text-white">
            Practice Mode
          </Label>
          <p className="text-xs text-gray-400 mt-1">
            Loops difficult sections and slows down playback
          </p>
        </div>
        <Switch
          id="practice-mode"
          checked={practiceMode}
          onCheckedChange={onPracticeModeToggle}
        />
      </div>
    </div>
  );
}