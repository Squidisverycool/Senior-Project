import numpy as np
import librosa
import crepe
from scipy.signal import savgol_filter
from src.config import Config

def extract_pitch_vocal(y, sr):
    """
    FIX 1: Proper time alignment between CREPE and librosa
    FIX 2: Less aggressive jump limiting for rhythm-guided approach
    """
    hop = Config.HOP_LENGTH

    # Calculate exact CREPE step size to match our hop
    step_ms = (hop / sr) * 1000  # Convert to milliseconds

    # RMS energy gate
    rms = librosa.feature.rms(y=y, hop_length=hop)[0]
    rms = rms / (np.max(rms) + 1e-6)

    # pYIN for range estimation
    f0_pyin, _, _ = librosa.pyin(
        y,
        fmin=80,
        fmax=1000,
        sr=sr,
        hop_length=hop
    )

    valid = ~np.isnan(f0_pyin)
    if np.sum(valid) > 20:
        fmin = max(60, np.percentile(f0_pyin[valid], 5) * 0.8)
        fmax = min(1200, np.percentile(f0_pyin[valid], 95) * 1.2)
    else:
        fmin, fmax = Config.FMIN, Config.FMAX

    # CREPE with ALIGNED time steps
    print(f"Running CREPE with step_size={step_ms:.2f}ms to match hop_length={hop}")
    _, f0_raw, conf, _ = crepe.predict(
        y,
        sr,
        step_size=step_ms,  # FIX: Now aligned with librosa
        viterbi=True,
        model_capacity="medium"
    )

    # Align lengths
    n = min(len(f0_raw), len(rms), len(f0_pyin))
    f0_raw = f0_raw[:n]
    conf = conf[:n]
    rms = rms[:n]
    f0_pyin = f0_pyin[:n]

    # Energy + confidence gate
    mask = (rms > 0.15) & (conf > 0.6)
    f0 = np.where(mask, f0_raw, np.nan)

    # FIX 2: More realistic jump limiting for singing
    # Singers can jump octaves (1200 cents) easily
    for i in range(1, len(f0)):
        if np.isnan(f0[i]) or np.isnan(f0[i-1]):
            continue

        cents = abs(1200 * np.log2(f0[i] / f0[i-1]))
        # Allow up to 600 cents (perfect 5th) between frames
        # Larger jumps likely indicate octave errors
        if cents > 600:
            # Check if it's an octave error
            ratio = f0[i] / f0[i-1]
            if 1.9 < ratio < 2.1:  # Octave up
                f0[i] = f0[i] / 2
            elif 0.45 < ratio < 0.55:  # Octave down
                f0[i] = f0[i] * 2
            else:
                # Otherwise keep previous pitch
                f0[i] = f0[i-1]

    # Segment-aware smoothing (preserve vibrato)
    voiced = ~np.isnan(f0)
    idx = np.where(voiced)[0]

    f0_smooth = np.copy(f0)

    if len(idx):
        segments = np.split(idx, np.where(np.diff(idx) != 1)[0] + 1)
        for seg in segments:
            if len(seg) >= 9:
                f0_smooth[seg] = savgol_filter(f0[seg], 9, 3)
            else:
                f0_smooth[seg] = np.nanmedian(f0[seg])

    # FIX 3: Better pYIN veto - catch octave errors even with high confidence
    f0_final = np.copy(f0_smooth)

    for i in range(len(f0_final)):
        if np.isnan(f0_smooth[i]) or np.isnan(f0_pyin[i]):
            continue

        cents_diff = abs(1200 * np.log2(f0_smooth[i] / f0_pyin[i]))

        # Veto if pYIN strongly disagrees AND confidence isn't very high
        if cents_diff > 120 and conf[i] < 0.75:
            f0_final[i] = np.nan

    times = librosa.times_like(f0_final, sr=sr, hop_length=hop)

    return {
        "times": times,
        "pitch_smooth": f0_final,
        "confidence": conf,
        "pitch_pyin": f0_pyin  # Keep for debugging
    }