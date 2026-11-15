'use client';

import { useState } from 'react';
import { ChefHat } from 'lucide-react';

type CookedButtonProps = {
  recipeId: string;
  initialLastCookedAt: string | null;
  initialCookedCount: number;
};

function formatDate(iso: string): string {
  const date = new Date(iso);
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
}

export function CookedButton({ recipeId, initialLastCookedAt, initialCookedCount }: CookedButtonProps) {
  const [lastCookedAt, setLastCookedAt] = useState<string | null>(initialLastCookedAt);
  const [cookedCount, setCookedCount] = useState(initialCookedCount);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCooked = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/recipes/${recipeId}/cooked`, { method: 'POST' });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error ?? '記録に失敗しました。');
      }
      setLastCookedAt(payload.lastCookedAt ?? new Date().toISOString());
      setCookedCount(payload.cookedCount ?? cookedCount + 1);
    } catch (err: any) {
      setError(err?.message ?? '記録に失敗しました。');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-[28px] border border-border bg-surface p-6 shadow-soft">
      <h2 className="mb-4 text-lg font-semibold text-textPrimary">作った記録</h2>
      {lastCookedAt ? (
        <p className="text-sm leading-7 text-textSecondary">
          最後に作った: {formatDate(lastCookedAt)}
          <br />
          {cookedCount}回作った
        </p>
      ) : (
        <p className="text-sm leading-7 text-textSecondary">まだ作った記録がありません。</p>
      )}
      <button
        type="button"
        onClick={handleCooked}
        disabled={isSaving}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accentDark disabled:opacity-50"
      >
        <ChefHat className="h-4 w-4" />
        {isSaving ? '記録中…' : '作った！'}
      </button>
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
