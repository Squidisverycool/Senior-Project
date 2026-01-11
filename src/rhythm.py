import librosa
import numpy as np

def detect_beats(y, sr, hop):
    tempo, beats = librosa.beat.beat_track(
        y=y,
        sr=sr,
        hop_length=hop,
        start_bpm=120,
        units="frames"
    )
    beat_times = librosa.frames_to_time(beats, sr=sr, hop_length=hop)
    tempo_val = float(np.atleast_1d(tempo)[0])
    return tempo_val, beat_times
