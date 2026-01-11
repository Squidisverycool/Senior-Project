from audio_io import load_audio
from src.pitch import extract_pitch_crepe
from src.postprocess import segment_notes
from src.separation import analyze_contour
from src.rhythm import plot_pitch

def analyze_audio(path):
    y, sr = load_audio(path)
    if y is None: return

    pitch = extract_pitch_crepe(y, sr)
    notes = segment_notes(pitch, sr)
    contour = analyze_contour(pitch)

    plot_pitch(pitch["times"], pitch["pitch_smooth"])

    return {
        "pitch": pitch,
        "notes": notes,
        "contour": contour
    }
