'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Heart, Plus, Search } from 'lucide-react';
import { RecipeCard } from '../components/RecipeCard';
import { tags } from '../lib/recipes';
import type { Recipe } from '../lib/recipes';

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/recipes')
      .then((response) => response.json())
      .then((data) => setRecipes(data))
      .catch(() => setRecipes([]))
      .finally(() => setIsLoading(false));
  }, []);

  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      const lowerQuery = query.trim().toLowerCase();
      const matchesQuery =
        !lowerQuery ||
        recipe.title.toLowerCase().includes(lowerQuery) ||
        recipe.description.toLowerCase().includes(lowerQuery) ||
        recipe.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
        recipe.ingredients.some((ingredient) => ingredient.toLowerCase().includes(lowerQuery));

      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.every((tag) => recipe.tags.includes(tag));

      const matchesFavorite = !favoriteOnly || Boolean(recipe.favorite);

      return matchesQuery && matchesTags && matchesFavorite;
    });
  }, [query, selectedTags, favoriteOnly, recipes]);

  const toggleTag = (tag: string) => {
    setSelectedTags((current) =>
      current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]
    );
  };

  const toggleFavorite = (recipeId: string, favorite: boolean) => {
    setRecipes((current) =>
      current.map((recipe) => (recipe.id === recipeId ? { ...recipe, favorite } : recipe))
    );
  };

  return (
    <main className="mx-auto max-w-6xl px-4 pb-24 pt-6 sm:px-6 lg:px-8">
      <header className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-accentDark">レシピノート</p>
          <h1 className="mt-1 text-2xl font-bold leading-tight text-textPrimary sm:text-3xl">
            家族のためのレシピ管理
          </h1>
        </div>
        <button
          type="button"
          onClick={() => setFavoriteOnly((current) => !current)}
          className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
            favoriteOnly
              ? 'border-[#ff8fa3] bg-[#fff0f3] text-[#e05a75]'
              : 'border-border bg-surface text-textPrimary hover:border-[#ff8fa3]'
          }`}
        >
          <Heart className={`h-4 w-4 ${favoriteOnly ? 'fill-[#ff8fa3] text-[#ff8fa3]' : ''}`} />
          お気に入り
        </button>
      </header>

      <div className="sticky top-0 z-20 -mx-4 bg-background/85 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex items-center gap-3 rounded-full border border-border bg-surface px-4 py-3 shadow-sm">
          <Search className="h-5 w-5 shrink-0 text-textSecondary" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="レシピ名・材料・タグで検索"
            className="w-full border-none bg-transparent text-base text-textPrimary outline-none placeholder:text-textSecondary"
          />
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {tags.map((tag) => {
            const active = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm transition ${
                  active
                    ? 'border-accent bg-accent text-white'
                    : 'border-border bg-surface text-textPrimary hover:border-accent hover:text-accent'
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      <p className="mt-4 text-sm text-textSecondary">{filteredRecipes.length} 件のレシピ</p>

      {isLoading ? (
        <div className="mt-6 rounded-3xl border border-border bg-surface p-6 text-center text-textSecondary">
          読み込み中...
        </div>
      ) : filteredRecipes.length === 0 ? (
        <div className="mt-6 rounded-3xl border border-border bg-surface p-6 text-center text-textSecondary">
          レシピが見つかりませんでした。右下の ＋ から追加できます。
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-3">
          {filteredRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      )}

      <footer className="mt-10 flex flex-wrap gap-4 text-sm font-semibold">
        <Link href="/cookpad" className="text-accent transition hover:text-accentDark">
          Cookpadランキングを見る →
        </Link>
        <Link href="/recipes" className="text-accent transition hover:text-accentDark">
          保存済みレシピ一覧 →
        </Link>
      </footer>

      <Link
        href="/recipes/new"
        aria-label="新しいレシピを追加"
        className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-soft transition hover:bg-accentDark"
      >
        <Plus className="h-7 w-7" />
      </Link>
    </main>
  );
}
