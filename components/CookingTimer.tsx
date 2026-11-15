'use client';

import { useEffect, useState } from 'react';
import { Clock3 } from 'lucide-react';
import type { RecipeStep } from '@/lib/recipes';

type CookingTimerProps = {
  steps: RecipeStep[];
};

export function CookingTimer({ steps }: CookingTimerProps) {
  const [timerSeconds, setTimerSeconds] = useState<number | null>(null);
  const [timerLabel, setTimerLabel] = useState('');

  useEffect(() => {
    if (timerSeconds === null || timerSeconds <= 0) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setTimerSeconds((current) => (current === null ? null : current - 1));
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [timerSeconds]);

  const startTimer = (seconds: number, label: string) => {
    setTimerSeconds(seconds);
    setTimerLabel(label);

    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('調理タイマー', { body: `${label} のタイマーを開始しました。` });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().catch(() => undefined);
      }
    }
  };

  const stopTimer = () => {
    setTimerSeconds(null);
    setTimerLabel('');
  };

  const timerDisplay = timerSeconds === null ? null : `${Math.floor(timerSeconds / 60)}:${String(timerSeconds % 60).padStart(2, '0')}`;

  const timerSteps = steps.filter((step) => /\d+分|\d+秒/.test(step.description));

  if (timerSteps.length === 0) {
    return null;
  }

  return (
    <div className="rounded-[28px] border border-border bg-surface p-6 shadow-soft">
      <div className="flex items-center gap-2 text-sm font-medium text-textSecondary">
        <Clock3 className="h-4 w-4 text-accent" />
        調理タイマー候補
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {timerSteps.map((step, index) => {
          const match = step.description.match(/(\d+)分| (\d+)秒/);
          const seconds = match ? (match[1] ? Number(match[1]) * 60 : Number(match[2])) : null;
          if (!seconds) return null;
          const label = step.label || `手順${index + 1}`;
          return (
            <button
              key={`${step.label}-${index}`}
              type="button"
              onClick={() => startTimer(seconds, label)}
              className="rounded-full border border-border bg-white px-3 py-2 text-sm text-textPrimary transition hover:border-accent hover:text-accent"
            >
              {label} · {match?.[0]}
            </button>
          );
        })}
      </div>
      {timerDisplay ? (
        <div className="mt-3 rounded-2xl border border-accent/20 bg-[#e6fafa] p-3 text-sm text-accentDark">
          <div className="flex items-center justify-between gap-3">
            <div className="font-semibold">{timerLabel} のタイマー</div>
            <button
              type="button"
              onClick={stopTimer}
              className="rounded-full border border-border bg-white px-3 py-1 text-xs font-semibold text-textPrimary transition hover:border-accent hover:text-accent"
            >
              止める
            </button>
          </div>
          <div className="mt-1 text-2xl font-bold">{timerDisplay}</div>
        </div>
      ) : null}
    </div>
  );
}
