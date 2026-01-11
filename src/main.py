import sys, os
from config import Config
from audio_io import load_audio
from separation import separate_vocals_demucs
from pitch import extract_pitch_vocal
from rhythm import detect_beats
from postprocess import bridge_short_gaps, enforce_beatwise_pitch
from synthesis import resynthesize_f0
from visualization import plot_pitch
from notes import segment_notes_from_pitch   # ✅ MISSING IMPORT
import soundfile as sf


def main(audio_path):
    os.makedirs("outputs", exist_ok=True)

    # 1. Vocal separation
    vocal = separate_vocals_demucs(audio_path)

    # 2. Load audio
    y, sr = load_audio(vocal, Config.SAMPLE_RATE)

    # 3. Rhythm
    tempo, beats = detect_beats(y, sr, Config.HOP_LENGTH)
    print(f"Tempo: {float(tempo):.1f} BPM")

    # 4. Pitch extraction
    pitch = extract_pitch_vocal(y, sr)

    # 5. Post-processing
    pitch["pitch_smooth"] = bridge_short_gaps(
        pitch["pitch_smooth"],
        max_gap_frames=12
    )

    pitch["pitch_smooth"] = enforce_beatwise_pitch(
        pitch["times"],
        pitch["pitch_smooth"],
        beats
    )

    # 6. Note segmentation  ✅ THIS FIXES YOUR ERROR
    notes = segment_notes_from_pitch(pitch)

    # 7. Resynthesis
    y_syn = resynthesize_f0(
        pitch["pitch_smooth"],
        sr,
        Config.HOP_LENGTH
    )
    resynth_path = "outputs/resynth.wav"
    sf.write(resynth_path, y_syn, sr)

    # 8. Visualization
    pitch_plot = "outputs/pitch.png"
    plot_pitch(
        pitch["times"],
        pitch["pitch_smooth"],
        beats,
        pitch_plot
    )

    print("✅ Analysis complete")

    # 9. RETURN OBJECT (for Gradio / HF Spaces)
    return {
        "resynth_path": resynth_path,
        "pitch_plot": pitch_plot,
        "notes": notes
    }


# OPTIONAL: CLI support (safe for HF Spaces)
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python main.py <audio_file>")
        sys.exit(1)

    main(sys.argv[1])
