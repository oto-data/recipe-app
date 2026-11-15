'use client';

export type ChipOption = {
  value: string;
  label: string;
};

type ChipSelectProps = {
  label: string;
  options: ChipOption[];
  value: string;
  onChange: (value: string) => void;
};

/** Single-select chip row. Tapping the active chip again clears it. */
export function ChipSelect({ label, options, value, onChange }: ChipSelectProps) {
  const allOptions =
    value && !options.some((option) => option.value === value)
      ? [...options, { value, label: value }]
      : options;

  return (
    <div className="space-y-2">
      <span className="text-sm font-medium text-textSecondary">{label}</span>
      <div className="flex flex-wrap gap-2">
        {allOptions.map((option) => {
          const active = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(active ? '' : option.value)}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                active
                  ? 'border-accent bg-accent text-white'
                  : 'border-border bg-white text-textPrimary hover:border-accent hover:text-accent'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

type TagChipsProps = {
  label: string;
  presetTags: string[];
  selectedTags: string[];
  onToggle: (tag: string) => void;
  onAddCustom: (tag: string) => void;
};

/** Multi-select tag chips with a free-form custom tag input. */
export function TagChips({ label, presetTags, selectedTags, onToggle, onAddCustom }: TagChipsProps) {
  const customTags = selectedTags.filter((tag) => !presetTags.includes(tag));
  const allTags = [...presetTags, ...customTags];

  return (
    <div className="space-y-3">
      <span className="text-sm font-medium text-textSecondary">{label}</span>
      <div className="flex flex-wrap gap-2">
        {allTags.map((tag) => {
          const active = selectedTags.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => onToggle(tag)}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                active
                  ? 'border-accent bg-accent text-white'
                  : 'border-border bg-background text-textPrimary hover:border-accent hover:text-accent'
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>
      <input
        type="text"
        placeholder="自由なタグを入力して Enter"
        className="w-full rounded-3xl border border-border bg-background px-4 py-2.5 text-sm text-textPrimary outline-none focus:border-accent"
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            const value = (event.target as HTMLInputElement).value.trim();
            if (value) {
              onAddCustom(value);
              (event.target as HTMLInputElement).value = '';
            }
          }
        }}
      />
    </div>
  );
}
