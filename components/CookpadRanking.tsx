'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { KeyboardEvent, MouseEvent } from 'react';
import type { CookpadRecipe } from '@/lib/cookpad';

type CookpadRankingProps = {
  recipes: CookpadRecipe[];
  limit?: number;
};

export function CookpadRanking({ recipes, limit = 5 }: CookpadRankingProps) {
  const router = useRouter();
  const previewRecipes = recipes.slice(0, limit);
  const showMore = recipes.length > limit;

  const handleOpen = (recipe: CookpadRecipe, event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest('a, button')) {
      return;
    }

    router.push(`/cookpad/${recipe.rank}`);
  };

  return (
    <section className="rounded-[28px] border border-border bg-surface p-6 shadow-soft">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-accentDark">Cookpadランキング</p>
          <h2 className="text-3xl font-semibold text-textPrimary">トップ100レシピ</h2>
          <p className="mt-3 max-w-2xl text-base leading-8 text-textSecondary">
            家庭で人気のCookpadランキングトップ100レシピを表示します。定番の和食からスイーツまで、まずは上位の人気メニューをチェック。
          </p>
        </div>
        {showMore ? (
          <Link
            href="/cookpad"
            className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-accentDark"
          >
            100件すべてを見る
          </Link>
        ) : null}
      </div>

      <div className="grid gap-4">
        {previewRecipes.map((recipe) => (
          <article
            key={recipe.rank}
            role="button"
            tabIndex={0}
            onClick={(event) => handleOpen(recipe, event)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                handleOpen(recipe, event);
              }
            }}
            className="rounded-3xl border border-border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-accent">#{recipe.rank}</p>
                <h3 className="mt-2 text-xl font-semibold text-textPrimary">{recipe.title}</h3>
                <p className="mt-2 text-sm leading-7 text-textSecondary">{recipe.description}</p>
              </div>
              <div className="text-right text-sm text-textSecondary">
                <p>{recipe.duration}</p>
                <p className="mt-1">{recipe.servings}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {recipe.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-background px-3 py-1 text-xs font-semibold text-textSecondary">
                  {tag}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
