import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { getRoutine, upsertRoutine } from "../utils/localStorageUtils";
import { v4 as uid } from "uuid";

export default function CreateRoutine() {
  const [q] = useSearchParams();
  const id = q.get("id");
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [rounds, setRounds] = useState([]);
  const [roundRest, setRoundRest] = useState(0);
  const [autoStart, setAutoStart] = useState(true);

  useEffect(() => {
    if (id) {
      const r = getRoutine(id);
      if (r) {
        setName(r.name || "");
        setRounds(r.rounds || []);
        setRoundRest(r.roundRest || 0);
        setAutoStart(r.autoStart !== false);
      }
    } else {
      // default: empty list (user requested)
      setRounds([]);
    }
  }, [id]);

  function addRound() {
    setRounds([
      ...rounds,
      { name: "", sets: 1, work: 30, rest: 25, extraBreak: 0 },
    ]);
  }

  function updateRound(idx, patch) {
    const copy = [...rounds];
    copy[idx] = { ...copy[idx], ...patch };
    setRounds(copy);
  }

  function removeRound(idx) {
    setRounds(rounds.filter((_, i) => i !== idx));
  }

  function save() {
    if (!name.trim()) return alert("Please enter a routine name");
    if (rounds.length === 0) return alert("Add at least one round");
    const obj = {
      id: id || uid(),
      name: name.trim(),
      rounds,
      roundRest,
      autoStart,
    };
    upsertRoutine(obj);
    navigate("/");
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="card">
        <h2 className="text-2xl font-semibold mb-3">Routine details</h2>

        <label className="block text-sm mb-1">Routine name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Full Body Circuit"
          className="input-base"
        />

        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Rounds</h3>

          <div className="space-y-3">
            {rounds.map((r, i) => (
              <div
                key={i}
                className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              >
                <div className="flex items-center justify-between gap-4 mb-2">
                  <input
                    className="input-base flex-1 mr-3"
                    placeholder="Round name (e.g. Shoulders)"
                    value={r.name}
                    onChange={(e) => updateRound(i, { name: e.target.value })}
                  />
                  <button
                    onClick={() => removeRound(i)}
                    className="text-red-500 ml-2"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs text-slate-500">Sets</label>
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        className="btn-ghost px-2"
                        onClick={() =>
                          updateRound(i, { sets: Math.max(1, (r.sets || 1) - 1) })
                        }
                      >
                        -1
                      </button>
                      <input
                        type="number"
                        value={r.sets}
                        onChange={(e) =>
                          updateRound(i, { sets: Number(e.target.value || 0) })
                        }
                        className="input-base text-center"
                      />
                      <button
                        className="btn-ghost px-2"
                        onClick={() => updateRound(i, { sets: (r.sets || 1) + 1 })}
                      >
                        +1
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-500">
                      Work (sec)
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        className="btn-ghost px-2"
                        onClick={() =>
                          updateRound(i, { work: Math.max(0, (r.work || 0) - 5) })
                        }
                      >
                        -5
                      </button>
                      <input
                        type="number"
                        value={r.work}
                        onChange={(e) =>
                          updateRound(i, { work: Number(e.target.value || 0) })
                        }
                        className="input-base text-center"
                      />
                      <button
                        className="btn-ghost px-2"
                        onClick={() => updateRound(i, { work: (r.work || 0) + 5 })}
                      >
                        +5
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-500">
                      Rest (sec)
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        className="btn-ghost px-2"
                        onClick={() =>
                          updateRound(i, { rest: Math.max(0, (r.rest || 0) - 5) })
                        }
                      >
                        -5
                      </button>
                      <input
                        type="number"
                        value={r.rest}
                        onChange={(e) =>
                          updateRound(i, { rest: Number(e.target.value || 0) })
                        }
                        className="input-base text-center"
                      />
                      <button
                        className="btn-ghost px-2"
                        onClick={() => updateRound(i, { rest: (r.rest || 0) + 5 })}
                      >
                        +5
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-500">
                      Extra Break (optional, sec)
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="number"
                        value={r.extraBreak || 0}
                        onChange={(e) =>
                          updateRound(i, { extraBreak: Number(e.target.value || 0) })
                        }
                        className="input-base text-center"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Round button moved below the rounds */}
          <div className="mt-4">
            <button onClick={addRound} className="btn-primary">
              + Add Round
            </button>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-6">
          <div>
            <label className="block text-xs text-slate-500">Round rest (sec)</label>
            <input
              type="number"
              value={roundRest}
              onChange={(e) => setRoundRest(Number(e.target.value || 0))}
              className="input-base w-40"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="auto"
              type="checkbox"
              checked={autoStart}
              onChange={(e) => setAutoStart(e.target.checked)}
            />
            <label htmlFor="auto" className="text-sm">
              Auto-start next set/round
            </label>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button onClick={save} className="btn-primary">
            Save Routine
          </button>
          <Link to="/" className="btn-ghost">
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}