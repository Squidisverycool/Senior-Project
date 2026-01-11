import librosa

def load_audio(path, sr):
    y, sr = librosa.load(path, sr=sr)
    print(f"Loaded {path} ({len(y)/sr:.2f}s)")
    return y, sr
