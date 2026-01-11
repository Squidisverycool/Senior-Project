import os

# Create project folder
os.makedirs("project", exist_ok=True)

def write(path, text):
    with open(os.path.join("project", path), "w", encoding="utf8") as f:
        f.write(text)


# ============================================================
# config.py
# ============================================================
write("config.py", """\
class Config:
    SAMPLE_RATE = 22050
    HOP_LENGTH = 256
    FRAME_LENGTH = 2048
    N_FFT = 2048

    FMIN = 65
    FMAX = 1500

    MEDIAN_FILTER = 7
    SG_WINDOW = 17
    SG_POLY = 3

    CONF_THRESHOLD = 0.5
    PYIN_THRESHOLD = 0.6

    MIN_NOTE_DURATION = 0.25
    STABILITY_CENTS = 80
""")

# ============================================================
# audio_io.py
# ============================================================
write("audio_io.py", """\
import librosa
from config import Config

def load_audio(path, sr=Config.SAMPLE_RATE):
    try:
        y, sr = librosa.load(path, sr=sr)
        print(f"Loaded audio: {len(y)/sr:.2f}s at {sr}Hz")
        return y, sr
    except Exception as e:
        print("Error loading audio:", e)
        return None, None
""")

# ============================================================
# pitch_utils.py
# ============================================================
write("pitch_utils.py", """\
import numpy as np
from scipy.signal import medfilt, savgol_filter
from scipy.interpolate import interp1d
import librosa
import crepe
from config import Config

def correct_octave_jumps(f0):
    f0 = np.array(f0, dtype=float)
    out = np.copy(f0)
    for i in range(1, len(f0)):
        if np.isnan(f0[i]) or np.isnan(f0[i-1]):
            continue
        ratio = f0[i] / f0[i-1]
        if 1.9 < ratio < 2.1:
            out[i] = f0[i] / 2
        elif 0.45 < ratio < 0.55:
            out[i] = f0[i] * 2
    return out

def extract_pitch_crepe(y, sr):
    times, f0_raw, conf, _ = crepe.predict(
        y, sr, step_size=10, model_capacity="full", viterbi=True
    )
    hop = int(round(sr * 0.01))
    times = librosa.times_like(f0_raw, sr=sr, hop_length=hop)

    voiced = conf >= Config.CONF_THRESHOLD
    f0_voiced = np.where(voiced, f0_raw, np.nan)

    valid = (f0_voiced >= Config.FMIN) & (f0_voiced <= Config.FMAX)
    f0_range = np.where(valid, f0_voiced, np.nan)

    f0_oct = correct_octave_jumps(f0_range)

    def remove_iqr(x):
        valid = ~np.isnan(x)
        if np.sum(valid) < 4: return x
        q1 = np.percentile(x[valid], 25)
        q3 = np.percentile(x[valid], 75)
        iqr = q3 - q1
        low = q1 - 1.5*iqr
        high = q3 + 1.5*iqr
        y = np.copy(x)
        y[(x < low) | (x > high)] = np.nan
        return y

    f0_clean = remove_iqr(f0_oct)

    idx = np.arange(len(f0_clean))
    valid = ~np.isnan(f0_clean)
    if np.sum(valid) > 2:
        interp_fn = interp1d(idx[valid], f0_clean[valid],
                             bounds_error=False, fill_value=np.nan)
        f0_interp = interp_fn(idx)
    else:
        f0_interp = f0_clean

    f0_med = np.copy(f0_interp)
    voiced_idx = np.where(~np.isnan(f0_interp))[0]
    if len(voiced_idx) > 0:
        k = max(3, Config.MEDIAN_FILTER)
        if k % 2 == 0: k += 1
        f0_med[voiced_idx] = medfilt(f0_interp[voiced_idx], k)

    f0_smooth = np.copy(f0_med)
    v2 = ~np.isnan(f0_med)
    if np.sum(v2) > Config.SG_WINDOW:
        f0_smooth[v2] = savgol_filter(
            f0_med[v2], Config.SG_WINDOW, Config.SG_POLY
        )

    return {
        "times": times,
        "pitch": f0_raw,
        "pitch_voiced": f0_voiced,
        "pitch_clean": f0_clean,
        "pitch_smooth": f0_smooth,
        "confidence": conf
    }
""")

# ============================================================
# segment.py (note segmentation)
# ============================================================
write("segment.py", """\
import numpy as np
import librosa
from config import Config

_NOTE_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']

def _midi_to_note_name(m):
    return _NOTE_NAMES[m % 12] + str(m//12 - 1)

def segment_notes(pitch_data, sr):
    t = pitch_data["times"]
    f0 = pitch_data.get("pitch_smooth", pitch_data["pitch"])
    if len(f0) < 3:
        return []

    safe = np.copy(f0)
    safe[np.isnan(safe)] = 0
    midi = librosa.hz_to_midi(np.maximum(safe, 1e-6))

    segments = []
    cur = []

    for i in range(len(midi)):
        if np.isnan(f0[i]):
            if cur:
                segments.append(cur)
                cur = []
        else:
            cur.append(i)

    if cur:
        segments.append(cur)

    notes = []
    for seg in segments:
        start = t[seg[0]]
        end = t[seg[-1]]
        dur = end - start
        if dur < Config.MIN_NOTE_DURATION:
            continue
        med = float(np.nanmedian(midi[seg]))
        name = _midi_to_note_name(int(round(med)))
        notes.append({
            "start": start,
            "end": end,
            "duration": dur,
            "midi": int(round(med)),
            "note_name": name
        })
    return notes
""")

# ============================================================
# analysis.py
# ============================================================
write("analysis.py", """\
import numpy as np
import librosa

def analyze_contour(pitch_data):
    t = pitch_data["times"]
    f0 = pitch_data.get("pitch_smooth", pitch_data["pitch"])

    valid = ~np.isnan(f0)
    if np.sum(valid) < 3:
        return None

    f = f0[valid]
    midi = librosa.hz_to_midi(f)

    intervals = np.diff(midi)
    shape = ["↑" if x>0 else "↓" if x<0 else "=" for x in intervals]

    return {
        "pitch_range": np.max(f)-np.min(f),
        "std": np.std(f),
        "intervals": intervals,
        "contour_shape": "".join(shape[:50])
    }
""")

# ============================================================
# plot_utils.py
# ============================================================
write("plot_utils.py", """\
import matplotlib.pyplot as plt

def plot_pitch(times, f0_smooth):
    plt.figure(figsize=(14,4))
    plt.plot(times, f0_smooth)
    plt.title("Pitch Contour")
    plt.xlabel("Time (s)")
    plt.ylabel("Hz")
    plt.show()
""")

# ============================================================
# pipeline.py
# ============================================================
write("pipeline.py", """\
from audio_io import load_audio
from pitch_utils import extract_pitch_crepe
from segment import segment_notes
from analysis import analyze_contour
from plot_utils import plot_pitch

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
""")

# ============================================================
print("\n✅ Project generated successfully!")
print("Open the 'project' folder in VS Code.\n")
