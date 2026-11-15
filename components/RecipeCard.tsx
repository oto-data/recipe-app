'use client';

import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import type { KeyboardEvent, MouseEvent } from 'react';
import { getCategoryMeta } from '@/lib/recipes';
import type { Recipe } from '@/lib/recipes';

type RecipeCardProps = {
  recipe: Recipe;
  /** Kept for compatibility with existing callers; deletion now lives on the detail page. */
  onDeleted?: () => void;
  onError?: (message: string) => void;
  onToggleFavorite?: (recipeId: string, favorite: boolean) => void;
};

export function RecipeCard({ recipe, onError, onToggleFavorite }: RecipeCardProps) {
  const router = useRouter();
  const meta = getCategoryMeta(recipe.category);

  const handleCardOpen = (event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest('button, a, input, select, textarea')) {
      return;
    }
    router.push(`/recipes/${recipe.id}`);
  };

  const handleToggleFavorite = async () => {
    const nextFavorite = !recipe.favorite;
    const response = await fetch(`/api/recipes/${recipe.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...recipe, favorite: nextFavorite })
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
      className="overflow-hidden rounded-[26px] border border-border bg-surface shadow-soft transition duration-200 hover:-translate-y-1"
    >
      <div className={`relative flex h-32 items-center justify-center bg-gradient-to-br ${meta.gradient} sm:h-40`}>
        {recipe.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={recipe.image} alt={recipe.title} className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <span className="text-6xl" aria-hidden="true">
            {meta.emoji}
          </span>
        )}
        {recipe.category ? (
          <span className="absolute left-3 top-3 rounded-full bg-white/85 px-3 py-1 text-xs font-semibold text-accentDark">
            {recipe.category}
          </span>
        ) : null}
        <button
          type="button"
          onClick={handleToggleFavorite}
          aria-label={recipe.favorite ? 'お気に入りを解除' : 'お気に入りに追加'}
          className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 shadow-sm transition hover:scale-105"
        >
          <Heart
            className={`h-5 w-5 ${recipe.favorite ? 'fill-[#ff8fa3] text-[#ff8fa3]' : 'text-textSecondary'}`}
          />
        </button>
      </div>

      <div className="p-4">
        <h3 className="line-clamp-2 text-base font-semibold leading-snug text-textPrimary sm:text-lg">
          {recipe.title}
        </h3>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-textSecondary">
          {recipe.duration ? <span>⏱ {recipe.duration}</span> : null}
          {recipe.servings ? <span>👥 {recipe.servings}</span> : null}
        </div>
        {recipe.tags.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {recipe.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-background px-2.5 py-1 text-xs font-semibold text-textSecondary"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}
