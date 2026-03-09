import { mockPitchCurve } from "./mockPitchData";
import { mockNotes } from "./mockNotes";

export async function analyzeAudioMock(file: File) {
  await new Promise(r => setTimeout(r, 800)); // fake latency

  return {
    pitch_curve: mockPitchCurve,
    notes: mockNotes
  };
}
