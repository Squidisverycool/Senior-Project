import { Mic } from "lucide-react";

export function Header() {
  return (
    <header className="w-full border-b border-zinc-800 bg-black/95 backdrop-blur-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-5">
        <div className="flex items-center gap-3">
          <div className="size-12 md:size-14 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30">
            <Mic className="size-6 md:size-7 text-black" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">VoiceCoach</h1>
            <p className="text-xs md:text-sm text-gray-400">Visualize your pitch, master your voice</p>
          </div>
        </div>
      </div>
    </header>
  );
}