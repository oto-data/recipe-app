'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ChefHat, ListChecks, X } from 'lucide-react';
import type { Recipe } from '@/lib/recipes';
import { CookingTimer } from '@/components/CookingTimer';

type CookingModeProps = {
  recipe: Recipe;
};

type WakeLockSentinelLike = { release: () => Promise<void> };

/**
 * Full-screen cooking mode: one step at a time in large text,
 * ingredients always reachable, and the step timers from CookingTimer.
 */
export function CookingMode({ recipe }: CookingModeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [showIngredients, setShowIngredients] = useState(false);
  const wakeLockRef = useRef<WakeLockSentinelLike | null>(null);

  const steps = recipe.steps;
  const total = steps.length;
  const current = steps[stepIndex];

  const releaseWakeLock = useCallback(async () => {
    try {
      await wakeLockRef.current?.release();
    } catch {
      // already released / unsupported: ignore
    }
    wakeLockRef.current = null;
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;

    const requestWakeLock = async () => {
      try {
        const wakeLock = (navigator as any).wakeLock;
        if (wakeLock?.request) {
          const sentinel = await wakeLock.request('screen');
          if (!cancelled) {
            wakeLockRef.current = sentinel as WakeLockSentinelLike;
          } else {
            await sentinel.release().catch(() => undefined);
          }
        }
      } catch {
        // Wake Lock unsupported or denied: cooking mode works without it.
      }
    };

    requestWakeLock();
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') requestWakeLock();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', handleVisibility);
      void releaseWakeLock();
    };
  }, [isOpen, releaseWakeLock]);

  const open = () => {
    setStepIndex(0);
    setShowIngredients(false);
    setIsOpen(true);
  };

  const close = () => {
    void releaseWakeLock();
    setIsOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={open}
        disabled={total === 0}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accentDark disabled:opacity-40"
      >
        <ChefHat className="h-4 w-4" />
        調理モードで作る
      </button>

      {isOpen && current ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-background">
          <header className="flex items-center justify-between gap-3 px-5 py-4">
            <p className="min-w-0 flex-1 truncate text-base font-bold text-textPrimary">{recipe.title}</p>
            <span className="shrink-0 rounded-full bg-surface px-3 py-1 text-sm font-semibold text-textSecondary">
              {stepIndex + 1} / {total}
            </span>
            <button
              type="button"
              onClick={close}
              aria-label="調理モードを閉じる"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface text-textPrimary shadow-sm transition hover:text-accent"
            >
              <X className="h-5 w-5" />
            </button>
          </header>

          <div className="mx-5 h-2 overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-accent transition-all"
              style={{ width: `${((stepIndex + 1) / total) * 100}%` }}
            />
          </div>

          <div className="flex flex-1 flex-col overflow-y-auto px-5 py-6">
            <div className="flex flex-1 flex-col justify-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accentDark">
                ステップ {stepIndex + 1}
              </p>
              {current.label ? (
                <h2 className="mt-3 text-3xl font-bold leading-snug text-textPrimary">{current.label}</h2>
              ) : null}
              <p className="mt-4 whitespace-pre-wrap text-2xl font-medium leading-relaxed text-textPrimary">
                {current.description}
              </p>
            </div>

            {showIngredients ? (
              <div className="mt-6 rounded-3xl border border-border bg-surface p-5">
                <h3 className="mb-3 text-base font-semibold text-textPrimary">材料</h3>
                <ul className="space-y-2">
                  {recipe.ingredients.map((item, index) => (
                    <li key={`${item}-${index}`} className="rounded-2xl bg-background px-4 py-2.5 text-base text-textPrimary">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="mt-6">
              <CookingTimer steps={steps} />
            </div>
          </div>

          <footer className="space-y-3 px-5 pb-6 pt-2">
            <button
              type="button"
              onClick={() => setShowIngredients((value) => !value)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-surface px-4 py-3 text-sm font-semibold text-textPrimary transition hover:border-accent hover:text-accent"
            >
              <ListChecks className="h-4 w-4" />
              {showIngredients ? '材料を隠す' : '材料を見る'}
            </button>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStepIndex((value) => Math.max(0, value - 1))}
                disabled={stepIndex === 0}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-border bg-surface px-4 py-4 text-base font-semibold text-textPrimary transition hover:border-accent hover:text-accent disabled:opacity-40"
              >
                <ArrowLeft className="h-5 w-5" />
                前へ
              </button>
              {stepIndex < total - 1 ? (
                <button
                  type="button"
                  onClick={() => setStepIndex((value) => Math.min(total - 1, value + 1))}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-accent px-4 py-4 text-base font-semibold text-white transition hover:bg-accentDark"
                >
                  次へ
                  <ArrowRight className="h-5 w-5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={close}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-accent px-4 py-4 text-base font-semibold text-white transition hover:bg-accentDark"
                >
                  <Check className="h-5 w-5" />
                  完了・閉じる
                </button>
              )}
            </div>
          </footer>
        </div>
      ) : null}
    </>
  );
}
