import { iconKeys } from "@/lib/icons";

export function IconSelect({ value, label = "Icon" }: { value?: string | null; label?: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-forest-900">{label}</label>
      <select name="icon" defaultValue={value ?? ""} className="input-admin">
        <option value="Globe2">Globe2 (default)</option>
        {iconKeys.map((key) => (
          <option key={key} value={key}>
            {key}
          </option>
        ))}
      </select>
    </div>
  );
}