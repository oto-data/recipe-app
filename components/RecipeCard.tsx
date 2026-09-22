'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Clock3, Heart, Trash2, Sparkles } from 'lucide-react';
import { useEffect, useState, type KeyboardEvent, type MouseEvent } from 'react';
import type { Recipe } from '@/lib/recipes';

type RecipeCardProps = {
  recipe: Recipe;
  onDeleted?: () => void;
  onError?: (message: string) => void;
  onToggleFavorite?: (recipeId: string, favorite: boolean) => void;
};

export function RecipeCard({ recipe, onDeleted, onError, onToggleFavorite }: RecipeCardProps) {
  const router = useRouter();
  const [showDetails, setShowDetails] = useState(false);
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

  const handleCardOpen = (event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest('button, a, input, select, textarea')) {
      return;
    }

    router.push(`/recipes/${recipe.id}`);
  };

  const handleDelete = async () => {
    const confirmed = window.confirm('このレシピを一覧から削除しますか？');
    if (!confirmed) {
      return;
    }

    const response = await fetch(`/api/recipes/${recipe.id}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      if (onDeleted) {
        onDeleted();
      } else {
        router.refresh();
      }
      return;
    }

    const payload = await response.json().catch(() => null);
    const message = payload?.error ?? '削除に失敗しました。';
    if (onError) {
      onError(message);
    } else {
      window.alert(message);
    }
  };

  const handleToggleFavorite = async () => {
    const nextFavorite = !recipe.favorite;
    const response = await fetch(`/api/recipes/${recipe.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...recipe, favorite: nextFavorite, tags: recipe.tags, ingredients: recipe.ingredients, steps: recipe.steps })
    });

    if (!response.ok) {
      if (onError) {
        onError('お気に入りの更新に失敗しました。');
      }
      return;
    }

    if (onToggleFavorite) {
      onToggleFavorite(recipe.id, nextFavorite);
    }
  };

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

  const timerDisplay = timerSeconds === null ? null : `${Math.floor(timerSeconds / 60)}:${String(timerSeconds % 60).padStart(2, '0')}`;

  const timerSteps = recipe.steps.filter((step) => /\d+分|\d+秒/.test(step.description));

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={handleCardOpen}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleCardOpen(event);
        }
      }}
      className="rounded-[26px] border border-border bg-surface p-5 shadow-soft transition duration-200 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(90,62,35,0.16)]"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#f7efe5] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-accentDark">
              {recipe.category || 'カテゴリ未設定'}
            </span>
            {recipe.favorite ? (
              <span className="rounded-full bg-[#fff2d8] px-3 py-1 text-xs font-semibold text-accentDark">お気に入り</span>
            ) : null}
          </div>
          <h3 className="mt-4 text-xl font-semibold text-textPrimary">{recipe.title}</h3>
          <p className="mt-2 text-sm leading-7 text-textSecondary">{recipe.description}</p>
        </div>
        <div className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-textSecondary">
          <p>{recipe.duration}</p>
          <p className="mt-1">{recipe.servings}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {recipe.tags.map((tag) => (
          <span key={tag} className="rounded-full bg-background px-3 py-1 text-xs font-semibold text-textSecondary">{tag}</span>
        ))}
      </div>

      {timerSteps.length > 0 ? (
        <div className="mt-4 rounded-2xl border border-border bg-background p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-textSecondary">
            <Clock3 className="h-4 w-4 text-accent" />
            調理タイマー候補
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {timerSteps.map((step, index) => {
              const match = step.description.match(/(\d+)分| (\d+)秒/);
              const seconds = match ? (match[1] ? Number(match[1]) * 60 : Number(match[2])) : null;
              if (!seconds) return null;
              return (
                <button
                  key={`${step.label}-${index}`}
                  type="button"
                  onClick={() => startTimer(seconds, step.label)}
                  className="rounded-full border border-border bg-white px-3 py-2 text-sm text-textPrimary transition hover:border-accent hover:text-accent"
                >
                  {step.label} · {match?.[0]}
                </button>
              );
            })}
          </div>
          {timerDisplay ? (
            <div className="mt-3 rounded-2xl border border-accent/20 bg-[#fff7ed] p-3 text-sm text-accentDark">
              <div className="font-semibold">{timerLabel} のタイマー</div>
              <div className="mt-1 text-2xl font-bold">{timerDisplay}</div>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setShowDetails((current) => !current)}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-textPrimary transition hover:border-accent hover:text-accent"
          >
            <Sparkles className="h-4 w-4" />
            {showDetails ? '詳細を閉じる' : '材料・手順を見る'}
          </button>
          <button
            type="button"
            onClick={handleToggleFavorite}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${recipe.favorite ? 'border-accent bg-[#fff6eb] text-accent' : 'border-border bg-white text-textPrimary hover:border-accent hover:text-accent'}`}
          >
            <Heart className={`h-4 w-4 ${recipe.favorite ? 'fill-accent' : ''}`} />
            {recipe.favorite ? 'お気に入り済み' : 'お気に入り'}
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/recipes/${recipe.id}`} className="inline-flex items-center justify-center rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accentDark">
            詳細
          </Link>
          <Link href={`/recipes/${recipe.id}/edit`} className="inline-flex items-center justify-center rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-textPrimary transition hover:border-accent hover:text-accent">
            編集
          </Link>
          <button type="button" onClick={handleDelete} className="inline-flex items-center justify-center rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100">
            <Trash2 className="mr-1 h-4 w-4" />
            削除
          </button>
        </div>
      </div>

      {showDetails ? (
        <div className="mt-5 space-y-4 rounded-[24px] border border-border bg-background p-4">
          <div>
            <p className="text-sm font-semibold text-textSecondary">材料</p>
            <ul className="mt-3 space-y-2 text-sm text-textPrimary">
              {recipe.ingredients.map((item) => (
                <li key={item} className="rounded-2xl border border-border bg-white px-3 py-2">{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-textSecondary">手順</p>
            <div className="mt-3 space-y-2 text-sm text-textPrimary">
              {recipe.steps.map((step, index) => (
                <div key={`${step.label}-${index}`} className="rounded-2xl border border-border bg-white px-3 py-3">
                  <div className="font-semibold">{index + 1}. {step.label}</div>
                  <p className="mt-1 text-textSecondary">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}
