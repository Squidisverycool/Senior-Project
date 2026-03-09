import { Plus, Minus, RotateCcw } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Switch } from "@/app/components/ui/switch";
import { Label } from "@/app/components/ui/label";

interface PitchControlsProps {
  snapToNote: boolean;
  onSnapToggle: (checked: boolean) => void;
  onPitchAdjust: (halfSteps: number) => void;
  onReset: () => void;
}

export function PitchControls({
  snapToNote,
  onSnapToggle,
  onPitchAdjust,
  onReset,
}: PitchControlsProps) {
  return (
    <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-4 p-5 bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700/50 rounded-2xl">
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPitchAdjust(0.5)}
          className="gap-2 bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-600"
        >
          <Plus className="size-4" />
          ½ Step
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPitchAdjust(-0.5)}
          className="gap-2 bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-600"
        >
          <Minus className="size-4" />
          ½ Step
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="gap-2 bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-600"
        >
          <RotateCcw className="size-4" />
          Reset
        </Button>
      </div>
      
      <div className="flex items-center gap-2">
        <Switch
          id="snap-to-note"
          checked={snapToNote}
          onCheckedChange={onSnapToggle}
        />
        <Label htmlFor="snap-to-note" className="cursor-pointer text-gray-300">
          Snap to nearest note
        </Label>
      </div>
    </div>
  );
}