import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-zinc-800 bg-black/95 mt-16 md:mt-20">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-10">
        <div className="text-center space-y-3">
          <p className="text-sm text-gray-400 flex items-center justify-center gap-2">
            Made with <Heart className="size-4 text-green-500 fill-green-500 animate-pulse" /> for singers everywhere
          </p>
          <p className="text-xs text-gray-500">
            VoiceCoach - Your friendly companion for vocal practice and improvement
          </p>
        </div>
      </div>
    </footer>
  );
}