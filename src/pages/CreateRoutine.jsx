import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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

  // Load existing routine if editing
  useEffect(() => {
    if (id) {
      const r = getRoutine(id);
      if (r) {
        setName(r.name);
        setRounds(r.rounds);
        setRoundRest(r.roundRest || 0);
        setAutoStart(r.autoStart !== false);
      }
    }
  }, [id]);

  function addRound() {
    setRounds([
      ...rounds,
      { name: "", sets: 1, work: 30, rest: 25 },
    ]);
  }

  function updateRound(i, patch) {
    const copy = [...rounds];
    copy[i] = { ...copy[i], ...patch };
    setRounds(copy);
  }

  function removeRound(i) {
    setRounds(rounds.filter((_, idx) => idx !== i));
  }

  function save() {
    if (!name.trim()) return alert("Enter a routine name");
    if (rounds.length === 0) return alert("Add at least one round");

    upsertRoutine({
      id: id || uid(),
      name,
      rounds,
      roundRest,
      autoStart,
    });

    navigate("/");
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold mb-4">Create Routine</h2>

        {/* Name */}
        <label className="block mb-1 text-sm font-medium">Routine Name</label>
        <input
          className="input-base"
          placeholder="e.g. Full Body Circuit"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* Rounds */}
        <div className="flex items-center justify-between mt-6 mb-2">
          <h3 className="text-lg font-semibold">Rounds</h3>
          <button className="btn-primary text-sm" onClick={addRound}>
            + Add Round
          </button>
        </div>

        <div className="space-y-4">
          {rounds.map((r, i) => (
            <div
              key={i}
              className="p-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-md"
            >
              {/* Title Row */}
              <div className="flex justify-between items-center mb-3">
                <input
                  className="input-base"
                  placeholder="Round name (e.g. Shoulders)"
                  value={r.name}
                  onChange={(e) =>
                    updateRound(i, { name: e.target.value })
                  }
                />

                <button
                  className="text-red-500 text-sm"
                  onClick={() => removeRound(i)}
                >
                  Remove
                </button>
              </div>

              {/* Details */}
              <div className="grid grid-cols-3 gap-4 mt-3">
                {/* Sets */}
                <div>
                  <label className="block text-xs mb-1">Sets</label>
                  <div className="flex items-center gap-2">
                    <button
                      className="btn-ghost px-2"
                      onClick={() =>
                        updateRound(i, { sets: Math.max(1, r.sets - 1) })
                      }
                    >
                      -1
                    </button>
                    <input
                      type="number"
                      className="input-base text-center"
                      value={r.sets}
                      onChange={(e) =>
                        updateRound(i, { sets: Number(e.target.value) })
                      }
                    />
                    <button
                      className="btn-ghost px-2"
                      onClick={() => updateRound(i, { sets: r.sets + 1 })}
                    >
                      +1
                    </button>
                  </div>
                </div>

                {/* Work */}
                <div>
                  <label className="block text-xs mb-1">Work (sec)</label>
                  <div className="flex items-center gap-2">
                    <button
                      className="btn-ghost px-2"
                      onClick={() =>
                        updateRound(i, { work: Math.max(0, r.work - 5) })
                      }
                    >
                      -5
                    </button>
                    <input
                      type="number"
                      className="input-base text-center"
                      value={r.work}
                      onChange={(e) =>
                        updateRound(i, { work: Number(e.target.value) })
                      }
                    />
                    <button
                      className="btn-ghost px-2"
                      onClick={() => updateRound(i, { work: r.work + 5 })}
                    >
                      +5
                    </button>
                  </div>
                </div>

                {/* Rest */}
                <div>
                  <label className="block text-xs mb-1">Rest (sec)</label>
                  <div className="flex items-center gap-2">
                    <button
                      className="btn-ghost px-2"
                      onClick={() =>
                        updateRound(i, { rest: Math.max(0, r.rest - 5) })
                      }
                    >
                      -5
                    </button>
                    <input
                      type="number"
                      className="input-base text-center"
                      value={r.rest}
                      onChange={(e) =>
                        updateRound(i, { rest: Number(e.target.value) })
                      }
                    />
                    <button
                      className="btn-ghost px-2"
                      onClick={() => updateRound(i, { rest: r.rest + 5 })}
                    >
                      +5
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Round Rest */}
        <div className="mt-6">
          <label className="block text-xs mb-1">Rest Between Rounds (sec)</label>
          <input
            type="number"
            className="input-base w-40"
            value={roundRest}
            onChange={(e) => setRoundRest(Number(e.target.value))}
          />
        </div>

        {/* Auto-start */}
        <div className="mt-3 flex items-center gap-2">
          <input
            type="checkbox"
            checked={autoStart}
            onChange={(e) => setAutoStart(e.target.checked)}
          />
          <span className="text-sm">Auto-start next set/round</span>
        </div>

        <div className="flex gap-4 mt-6">
          <button className="btn-primary" onClick={save}>
            Save Routine
          </button>
          <button className="btn-ghost" onClick={() => navigate("/")}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}