import numpy as np


def bridge_short_gaps(f0, max_gap_frames=12):
    """
    Hold pitch across very short unvoiced gaps (consonants),
    but do NOT interpolate (no fake slides).
    """
    f0 = np.copy(f0)
    isnan = np.isnan(f0)

    i = 0
    while i < len(f0):
        if isnan[i]:
            j = i
            while j < len(f0) and isnan[j]:
                j += 1

            gap = j - i
            if gap <= max_gap_frames and i > 0 and j < len(f0):
                f0[i:j] = f0[i - 1]

            i = j
        else:
            i += 1

    return f0


def enforce_beatwise_pitch(
    times,
    f0,
    beat_times,
    max_flat_cents=80,
    min_frames=5
):
    """
    Snap pitch to a stable value *within each beat* when appropriate.

    - Preserves expressive passages
    - Does NOT invent pitch where there is silence
    - Only fills gaps when musically justified
    """
    f0_out = np.copy(f0)
    last_pitch = np.nan

    for i in range(len(beat_times) - 1):
        start = beat_times[i]
        end = beat_times[i + 1]

        idx = np.where((times >= start) & (times < end))[0]
        if len(idx) < min_frames:
            continue

        segment = f0[idx]
        valid = segment[~np.isnan(segment)]

        if len(valid) > 0:
            center = np.median(valid)
            cents = 1200 * np.log2(valid / center)

            if np.std(cents) < max_flat_cents:
                # Stable note → snap
                f0_out[idx] = center
                last_pitch = center
            else:
                # Expressive → keep original
                f0_out[idx] = f0[idx]
                last_pitch = np.nanmedian(valid)

        else:
            # Possible held note across beat boundary
            if not np.isnan(last_pitch):
                # Look ahead: does pitch resume nearby?
                next_pitch = None
                for j in idx:
                    if j + 1 < len(f0) and not np.isnan(f0[j + 1]):
                        next_pitch = f0[j + 1]
                        break

                if next_pitch is not None:
                    cents = abs(1200 * np.log2(next_pitch / last_pitch))
                    if cents < 200:
                        f0_out[idx] = last_pitch

    return f0_out
