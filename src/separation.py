import subprocess, os, librosa, soundfile as sf

def separate_vocals_demucs(input_path, workdir="outputs"):
    os.makedirs(workdir, exist_ok=True)
    temp_wav = os.path.join(workdir, "input.wav")

    y, sr = librosa.load(input_path, sr=44100)
    sf.write(temp_wav, y, sr)

    subprocess.run(
        ["demucs", "--two-stems", "vocals", "-o", workdir, temp_wav],
        check=True
    )

    for root, _, files in os.walk(workdir):
        if "vocals.wav" in files:
            return os.path.join(root, "vocals.wav")

    raise FileNotFoundError("Demucs vocals.wav not found")
