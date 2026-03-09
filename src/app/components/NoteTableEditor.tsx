import { Note } from "@/app/components/NoteTableEditor";

const NOTE_OPTIONS = [
  "C3","D3","E3","F3","G3","A3","B3",
  "C4","D4","E4","F4","G4","A4","B4",
  "C5","D5","E5","F5","G5",
];

interface Props {
  notes: Note[];
  onChange: (notes: Note[]) => void;
}

export function NoteTableEditor({ notes, onChange }: Props) {
  const updateNote = (index: number, updated: Partial<Note>) => {
    const next = [...notes];
    next[index] = { ...next[index], ...updated };
    onChange(next);
  };

  return (
    <div className="mt-6 overflow-x-auto rounded-xl border border-zinc-700 bg-zinc-900">
      <table className="w-full text-sm text-white">
        <thead className="bg-zinc-800 text-zinc-300">
          <tr>
            <th className="px-4 py-2 text-left">Note</th>
            <th className="px-4 py-2 text-left">Start (s)</th>
            <th className="px-4 py-2 text-left">End (s)</th>
          </tr>
        </thead>
        <tbody>
          {notes.map((note, i) => (
            <tr key={i} className="border-t border-zinc-700">
              <td className="px-4 py-2">
                <select
                  className="bg-zinc-800 border border-zinc-600 rounded px-2 py-1"
                  value={note.note_name}
                  onChange={(e) =>
                    updateNote(i, { note_name: e.target.value })
                  }
                >
                  {NOTE_OPTIONS.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </td>

              <td className="px-4 py-2">
                <input
                  type="number"
                  step="0.05"
                  className="w-24 bg-zinc-800 border border-zinc-600 rounded px-2 py-1"
                  value={note.start}
                  onChange={(e) =>
                    updateNote(i, { start: Number(e.target.value) })
                  }
                />
              </td>

              <td className="px-4 py-2">
                <input
                  type="number"
                  step="0.05"
                  className="w-24 bg-zinc-800 border border-zinc-600 rounded px-2 py-1"
                  value={note.end}
                  onChange={(e) =>
                    updateNote(i, { end: Number(e.target.value) })
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
