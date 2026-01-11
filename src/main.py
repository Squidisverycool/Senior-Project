import sys, os
from config import Config
from audio_io import load_audio
from separation import separate_vocals_demucs
from pitch import extract_pitch_vocal
from rhythm import detect_beats
from postprocess import bridge_short_gaps, enforce_beatwise_pitch
from synthesis import resynthesize_f0
from visualization import plot_pitch
import soundfile as sf

def main(audio_path):
    os.makedirs("outputs", exist_ok=True)

    vocal = separate_vocals_demucs(audio_path)
    y, sr = load_audio(vocal, Config.SAMPLE_RATE)

    tempo, beats = detect_beats(y, sr, Config.HOP_LENGTH)
    print(f"Tempo: {tempo:.1f} BPM")

    pitch = extract_pitch_vocal(y, sr)
    pitch["pitch_smooth"] = bridge_short_gaps(pitch["pitch_smooth"], 12)

    pitch["pitch_smooth"] = enforce_beatwise_pitch(
        pitch["times"],
        pitch["pitch_smooth"],
        beats
    )

    y_syn = resynthesize_f0(pitch["pitch_smooth"], sr, Config.HOP_LENGTH)
    sf.write("outputs/resynth.wav", y_syn, sr)

    plot_pitch(
        pitch["times"],
        pitch["pitch_smooth"],
        beats,
        "outputs/pitch.png"
    )

    print("✅ Analysis complete")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python src/main.py <audio.wav>")
        sys.exit(1)
    main(sys.argv[1])
