import numpy as np

def resynthesize_f0(f0, sr, hop, amp=0.3):
    y = np.zeros(len(f0) * hop, dtype=np.float32)
    phase = 0.0

    for i, f in enumerate(f0):
        if np.isnan(f) or f <= 0:
            phase = 0
            continue
        t = np.arange(hop) / sr
        y[i*hop:(i+1)*hop] = amp * np.sin(2*np.pi*f*t + phase)
        phase += 2*np.pi*f*hop/sr
        phase %= 2*np.pi
    return y
