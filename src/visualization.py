import matplotlib.pyplot as plt

def plot_pitch(times, f0, beat_times, outpath):
    plt.figure(figsize=(16,4))
    plt.plot(times, f0, label="Pitch")
    for b in beat_times:
        plt.axvline(b, color="r", alpha=0.2)
    plt.legend()
    plt.tight_layout()
    plt.savefig(outpath)
    plt.close()
