import numpy as np
import librosa
from src.config import Config

_NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F',
               'F#', 'G', 'G#', 'A', 'A#', 'B']


def _midi_to_note_name(midi):
    return _NOTE_NAMES[int(midi) % 12] + str(int(midi) // 12 - 1)


def segment_notes_from_pitch(pitch_data):
    """
    Segment continuous pitch into musical notes.

    Uses tolerant thresholds to avoid splitting notes
    during vibrato or expressive drift.
    """
    times = pitch_data["times"]
    f0 = pitch_data["pitch_smooth"]

    # Convert Hz → MIDI safely
    midi = librosa.hz_to_midi(np.maximum(f0, 1e-6))
    voiced = ~np.isnan(f0)

    notes = []
    current = []

    # More tolerant threshold (matches your latest logic)
    CHANGE_THRESH = 1.5   # semitones
    MIN_NOTE_FRAMES = 5   # ignore extremely short notes

    for i in range(1, len(f0)):
        if not voiced[i]:
            if current and len(current) >= MIN_NOTE_FRAMES:
                notes.append(current)
            current = []
            continue

        if not current:
            current = [i]
            continue

        prev_midi = midi[current[-1]]
        curr_midi = midi[i]

        if abs(curr_midi - prev_midi) > CHANGE_THRESH:
            if len(current) >= MIN_NOTE_FRAMES:
                notes.append(current)
            current = [i]
        else:
            current.append(i)

    if current and len(current) >= MIN_NOTE_FRAMES:
        notes.append(current)

    # Convert frame segments → note metadata
    final_notes = []
    hop = times[1] - times[0] if len(times) > 1 else 0.01

    for seg in notes:
        start = times[seg[0]]
        end = times[seg[-1]] + hop
        duration = end - start

        if duration < Config.MIN_NOTE_DURATION:
            continue

        median_midi = float(np.nanmedian(midi[seg]))
        note_int = int(round(median_midi))

        cents = (midi[seg] - note_int) * 100

        final_notes.append({
            "start": start,
            "end": end,
            "duration": duration,
            "midi": note_int,
            "note_name": _midi_to_note_name(note_int),
            "cents_off_mean": float(np.nanmean(cents)),
            "cents_off_std": float(np.nanstd(cents)),
        })

    return final_notes
