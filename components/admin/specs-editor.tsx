"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

type SpecRow = { uid: number; key: string; value: string };

type SpecsEditorProps = {
  name?: string;
  label?: string;
  initial?: Record<string, string>;
};

export function SpecsEditor({
  name = "specs",
  label = "Specifications & packaging",
  initial = {},
}: SpecsEditorProps) {
  const [nextUid, setNextUid] = useState(() => Object.keys(initial).length);
  const [rows, setRows] = useState<SpecRow[]>(() =>
    Object.entries(initial).map(([key, value], index) => ({ uid: index, key, value }))
  );

  const payload = useMemo(
    () =>
      rows.reduce<Record<string, string>>((acc, row) => {
        const key = row.key.trim();
        if (key) acc[key] = row.value.trim();
        return acc;
      }, {}),
    [rows]
  );

  function addRow() {
    const uid = nextUid;
    setNextUid((current) => current + 1);
    setRows((prev) => [...prev, { uid, key: "", value: "" }]);
  }

  function updateRow(uid: number, patch: Partial<Omit<SpecRow, "uid">>) {
    setRows((prev) => prev.map((row) => (row.uid === uid ? { ...row, ...patch } : row)));
  }

  function removeRow(uid: number) {
    setRows((prev) => prev.filter((row) => row.uid !== uid));
  }

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(payload)} />

      <div className="grid gap-2.5">
        {rows.map((row) => (
          <div
            key={row.uid}
            className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)_auto] items-center gap-2.5"
          >
            <input
              value={row.key}
              onChange={(e) => updateRow(row.uid, { key: e.target.value })}
              placeholder="Label, e.g. Packaging"
              className="input-admin"
              aria-label={`Specification label ${row.uid + 1}`}
            />
            <input
              value={row.value}
              onChange={(e) => updateRow(row.uid, { value: e.target.value })}
              placeholder="Detail, e.g. 50kg bulk PP bags"
              className="input-admin"
              aria-label={`Specification detail ${row.uid + 1}`}
            />
            <button
              type="button"
              onClick={() => removeRow(row.uid)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-soil-100 text-soil-800 transition-colors hover:bg-soil-700 hover:text-cream"
              aria-label="Remove row"
            >
              <Trash2 className="h-4 w-4" aria-hidden />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addRow}
        className="mt-3 inline-flex h-10 items-center gap-1.5 rounded-full bg-forest-100 px-4 text-sm font-semibold text-forest-800 transition-colors hover:bg-forest-700 hover:text-cream"
      >
        <Plus className="h-4 w-4" aria-hidden /> {label}
      </button>

      <p className="mt-2 text-xs text-forest-700/60">
        {rows.length === 0
          ? "Add rows to list specifications, packaging, certifications or custom details."
          : "Rows with an empty label are ignored when saving."}
      </p>
    </div>
  );
}