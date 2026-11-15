'use client';

import { useMemo, useState } from 'react';
import { parseBaseServings, scaleIngredients } from '@/lib/scaleIngredients';

type IngredientsScalerProps = {
  ingredients: string[];
  servings: string;
};

type ScaleChoice = {
  key: string;
  label: string;
  factor: number;
};

/**
 * Servings chips + ingredient checklist with display-only quantity scaling.
 * The stored ingredient text is never changed; only the rendering scales.
 */
export function IngredientsScaler({ ingredients, servings }: IngredientsScalerProps) {
  const baseServings = useMemo(() => parseBaseServings(servings), [servings]);

  const choices: ScaleChoice[] = useMemo(() => {
    const list: ScaleChoice[] = [{ key: 'original', label: '元の分量', factor: 1 }];
    if (baseServings !== 1) {
      list.push({ key: 'half', label: '半量', factor: 0.5 });
    }
    for (const target of [1, 2, 3, 4]) {
      if (target === baseServings) continue;
      list.push({ key: `servings-${target}`, label: `${target}人前`, factor: target / baseServings });
    }
    return list;
  }, [baseServings]);

  const [selectedKey, setSelectedKey] = useState('original');
  const selected = choices.find((choice) => choice.key === selectedKey) ?? choices[0];
  const factor = selected?.factor ?? 1;

  const displayIngredients = useMemo(
    () => (factor === 1 ? ingredients : scaleIngredients(ingredients, factor)),
    [ingredients, factor]
  );

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-textSecondary">
          分量の目安（{servings || '2人前'} 基準）
        </span>
        {choices.map((choice) => (
          <button
            key={choice.key}
            type="button"
            onClick={() => setSelectedKey(choice.key)}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition ${
              selectedKey === choice.key
                ? 'border-accent bg-accent text-white'
                : 'border-border bg-white text-textPrimary hover:border-accent hover:text-accent'
            }`}
          >
            {choice.label}
          </button>
        ))}
      </div>
      {factor !== 1 ? (
        <p className="mb-3 text-xs text-textSecondary">
          ※ 材料の量は目安表示です（保存されている分量は変わりません）。
        </p>
      ) : null}
      <div className="space-y-3">
        {displayIngredients.map((item, index) => (
          <label
            key={`${item}-${index}`}
            className="flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3 transition hover:border-accent"
          >
            <input type="checkbox" className="h-4 w-4 accent-accent" />
            <span className="text-base text-textPrimary">{item}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
