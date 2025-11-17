import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getRoutine, upsertRoutine } from "../utils/localStorageUtils";
import { v4 as uid } from "uuid";

/**
 * Defensive CreateRoutine.jsx
 * - avoids runtime crashes when rounds is undefined / not an array
 * - sanitizes numeric inputs
 * - uses functional setState for safety
 */

const toSafeNumber = (v, fallback = 0) => {
  // allow empty string -> fallback
  if (v === "" || v === null || v === undefined) return fallback;
  const s = String(v).replace(/\D/g, "").slice(0, 4); // max 4 digits
  if (s === "") return fallback;
  const n = parseInt(s, 10);
  return Number.isNaN(n) ? fallback : n;
};

export default function CreateRoutine() {
  const [q] = useSearchParams();
  const editingId = q.get("id");
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [rounds, setRounds] = useState([]); // always start as array
  const [roundRest, setRoundRest] = useState(0);
  const [autoStart, setAutoStart] = useState(true);

  useEffect(() => {
    try {
      if (editingId) {
        const stored = getRoutine(editingId);
        if (stored) {
          setName(stored.name || "");
          // ensure rounds is array
          setRounds(Array.isArray(stored.rounds) ? stored.rounds : []);
          setRoundRest(Number(stored.roundRest || 0));
          setAutoStart(Boolean(stored.autoStart));
        }
      } else {
        // keep empty array (explicit)
        setRounds((r) => (Array.isArray(r) ? r : []));
      }
    } catch (err) {
      // don't crash — log and keep defaults
      console.error("Error loading routine for edit:", err);
      setRounds([]);
    }
  }, [editingId]);

  // Safe add round
  const addRound = () => {
    try {
      const newRound = { name: "", sets: 1, work: 0, rest: 0, extraBreak: 0 };
      setRounds((prev) => {
        if (!Array.isArray(prev)) return [newRound];
        return [...prev, newRound];
      });
    } catch (err) {
      console.error("addRound error:", err);
    }
  };

  const removeRound = (index) => {
    try {
      setRounds((prev) => {
        if (!Array.isArray(prev)) return [];
        return prev.filter((_, i) => i !== index);
      });
    } catch (err) {
      console.error("removeRound error:", err);
    }
  };

  const updateRound = (index, patch) => {
    try {
      setRounds((prev) => {
        const safePrev = Array.isArray(prev) ? prev : [];
        const copy = safePrev.slice();
        copy[index] = { ...(copy[index] || {}), ...patch };
        return copy;
      });
    } catch (err) {
      console.error("updateRound error:", err);
    }
  };

  const save = () => {
    try {
      if (!name.trim()) {
        alert("Enter routine name");
        return;
      }
      const safeRounds = Array.isArray(rounds) ? rounds : [];
      if (safeRounds.length === 0) {
        alert("Add at least one round");
        return;
      }

      const cleanRounds = safeRounds.map((r) => ({
        name: String(r.name || ""),
        sets: toSafeNumber(r.sets, 1),
        work: toSafeNumber(r.work, 0),
        rest: toSafeNumber(r.rest, 0),
        extraBreak: toSafeNumber(r.extraBreak, 0),
      }));

      const payload = {
        id: editingId || uid(),
        name: name.trim(),
        rounds: cleanRounds,
        roundRest: toSafeNumber(roundRest, 0),
        autoStart: Boolean(autoStart),
      };

      upsertRoutine(payload);
      navigate("/");
    } catch (err) {
      console.error("Save routine failed:", err);
      alert("Failed to save routine. Check console for details.");
    }
  };

  // Guarded render: ensure rounds is array before mapping
  const roundsForRender = Array.isArray(rounds) ? rounds : [];

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-semibold">Create Routine</h1>
      </div>

      {/* Routine name */}
      <div className="card p-4">
        <label className="block text-sm mb-1">Routine name</label>
        <input
          className="input-base w-full"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Full Body Circuit"
        />
      </div>

      {/* Rounds list */}
      <div className="card p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Rounds</h2>
          <button onClick={addRound} className="btn-primary text-sm">
            + Add Round
          </button>
        </div>

        {roundsForRender.length === 0 && (
          <div className="text-slate-500 text-sm">No rounds — click “Add Round”.</div>
        )}

        {roundsForRender.map((r, i) => (
          <div key={i} className="border rounded-xl p-3">
            <div className="flex items-center justify-between mb-3 gap-3">
              <input
                className="input-base w-80"
                value={r.name || ""}
                onChange={(e) => updateRound(i, { name: e.target.value })}
                placeholder={`Round ${i + 1} name`}
              />
              <button
                onClick={() => removeRound(i)}
                className="text-red-600 text-sm"
              >
                Remove
              </button>
            </div>

            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-sm w-12">Sets</span>
                <input
                  className="input-num"
                  value={String(r.sets ?? 0)}
                  onChange={(e) =>
                    updateRound(i, { sets: toSafeNumber(e.target.value, 1) })
                  }
                  maxLength={4}
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm w-16">Work</span>
                <input
                  className="input-num"
                  value={String(r.work ?? 0)}
                  onChange={(e) =>
                    updateRound(i, { work: toSafeNumber(e.target.value, 0) })
                  }
                  maxLength={4}
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm w-16">Rest</span>
                <input
                  className="input-num"
                  value={String(r.rest ?? 0)}
                  onChange={(e) =>
                    updateRound(i, { rest: toSafeNumber(e.target.value, 0) })
                  }
                  maxLength={4}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-3">
              <span className="text-sm w-28">Extra Break</span>
              <input
                className="input-num"
                value={String(r.extraBreak ?? 0)}
                onChange={(e) =>
                  updateRound(i, {
                    extraBreak: toSafeNumber(e.target.value, 0),
                  })
                }
                maxLength={4}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Round rest + auto */}
      <div className="card p-4 flex items-center gap-6">
        <div>
          <label className="block text-xs text-slate-500 mb-1">
            Rest between rounds (sec)
          </label>
          <input
            className="input-num"
            value={String(roundRest ?? 0)}
            onChange={(e) => setRoundRest(toSafeNumber(e.target.value, 0))}
            maxLength={4}
          />
        </div>

        <div className="flex items-center gap-2 ml-6">
          <input
            id="autoStart"
            type="checkbox"
            checked={autoStart}
            onChange={(e) => setAutoStart(Boolean(e.target.checked))}
          />
          <label htmlFor="autoStart" className="text-sm">
            Auto-start next set/round
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={save} className="btn-primary">
          Save Routine
        </button>
        <button onClick={() => navigate("/")} className="btn-ghost">
          Cancel
        </button>
      </div>
    </div>
  );
}