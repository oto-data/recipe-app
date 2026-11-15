'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Heart, Plus, Search, ShoppingCart, Snowflake, X } from 'lucide-react';
import { RecipeCard } from '../components/RecipeCard';
import { tags } from '../lib/recipes';
import type { Recipe } from '../lib/recipes';
import { getShoppingRecipeIds, SHOPPING_CHANGED_EVENT } from '../lib/shoppingList';

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fridgeInput, setFridgeInput] = useState('');
  const [fridgeKeywords, setFridgeKeywords] = useState<string[]>([]);
  const [shoppingCount, setShoppingCount] = useState(0);

  useEffect(() => {
    fetch('/api/recipes')
      .then((response) => response.json())
      .then((data) => setRecipes(data))
      .catch(() => setRecipes([]))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const updateCount = () => setShoppingCount(getShoppingRecipeIds().length);
    updateCount();
    window.addEventListener(SHOPPING_CHANGED_EVENT, updateCount);
    window.addEventListener('storage', updateCount);
    return () => {
      window.removeEventListener(SHOPPING_CHANGED_EVENT, updateCount);
      window.removeEventListener('storage', updateCount);
    };
  }, []);

  const addFridgeKeywords = (raw: string) => {
    const additions = raw
      .split(/[、,，\s]+/)
      .map((item) => item.trim())
      .filter(Boolean);
    if (additions.length === 0) return;
    setFridgeKeywords((current) => [...new Set([...current, ...additions])]);
    setFridgeInput('');
  };

  /** Number of fridge keywords matched by each recipe's ingredients. */
  const fridgeMatchCounts = useMemo(() => {
    const counts = new Map<string, number>();
    if (fridgeKeywords.length === 0) return counts;
    for (const recipe of recipes) {
      const count = fridgeKeywords.filter((keyword) =>
        recipe.ingredients.some((ingredient) =>
          ingredient.toLowerCase().includes(keyword.toLowerCase())
        )
      ).length;
      counts.set(recipe.id, count);
    }
    return counts;
  }, [fridgeKeywords, recipes]);

  const filteredRecipes = useMemo(() => {
    const filtered = recipes.filter((recipe) => {
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

      const matchesFridge =
        fridgeKeywords.length === 0 || (fridgeMatchCounts.get(recipe.id) ?? 0) > 0;

      return matchesQuery && matchesTags && matchesFavorite && matchesFridge;
    });

    if (fridgeKeywords.length > 0) {
      filtered.sort(
        (a, b) => (fridgeMatchCounts.get(b.id) ?? 0) - (fridgeMatchCounts.get(a.id) ?? 0)
      );
    }
    return filtered;
  }, [query, selectedTags, favoriteOnly, fridgeKeywords, fridgeMatchCounts, recipes]);

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
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/shopping-list"
            className="relative inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-textPrimary transition hover:border-accent hover:text-accent"
          >
            <ShoppingCart className="h-4 w-4" />
            買い物リスト
            {shoppingCount > 0 ? (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-xs font-bold text-white">
                {shoppingCount}
              </span>
            ) : null}
          </Link>
          <button
            type="button"
            onClick={() => setFavoriteOnly((current) => !current)}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
              favoriteOnly
                ? 'border-[#ff8fa3] bg-[#fff0f3] text-[#e05a75]'
                : 'border-border bg-surface text-textPrimary hover:border-[#ff8fa3]'
            }`}
          >
            <Heart className={`h-4 w-4 ${favoriteOnly ? 'fill-[#ff8fa3] text-[#ff8fa3]' : ''}`} />
            お気に入り
          </button>
        </div>
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

      <section className="mt-4 rounded-3xl border border-border bg-surface p-4">
        <div className="flex items-center gap-2">
          <Snowflake className="h-5 w-5 text-accent" />
          <p className="text-sm font-semibold text-textPrimary">冷蔵庫から探す</p>
          {fridgeKeywords.length > 0 ? (
            <button
              type="button"
              onClick={() => setFridgeKeywords([])}
              className="ml-auto text-sm font-semibold text-accent transition hover:text-accentDark"
            >
              クリア
            </button>
          ) : null}
        </div>
        <p className="mt-1 text-sm text-textSecondary">
          家にある材料を入れると、使えるレシピを一致した材料が多い順に表示します。
        </p>
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={fridgeInput}
            onChange={(event) => setFridgeInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                addFridgeKeywords(fridgeInput);
              }
            }}
            placeholder="例：鶏肉、卵、玉ねぎ"
            className="w-full rounded-full border border-border bg-background px-4 py-2.5 text-base text-textPrimary outline-none placeholder:text-textSecondary focus:border-accent"
          />
          <button
            type="button"
            onClick={() => addFridgeKeywords(fridgeInput)}
            disabled={!fridgeInput.trim()}
            className="shrink-0 rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accentDark disabled:opacity-40"
          >
            追加
          </button>
        </div>
        {fridgeKeywords.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {fridgeKeywords.map((keyword) => (
              <span
                key={keyword}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#e6fafa] px-3 py-1.5 text-sm font-semibold text-accentDark"
              >
                {keyword}
                <button
                  type="button"
                  onClick={() =>
                    setFridgeKeywords((current) => current.filter((item) => item !== keyword))
                  }
                  aria-label={`${keyword} を外す`}
                  className="transition hover:text-red-500"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
        ) : null}
      </section>

      <p className="mt-4 text-sm text-textSecondary">
        {filteredRecipes.length} 件のレシピ
        {fridgeKeywords.length > 0 ? '（冷蔵庫の材料に一致する順）' : ''}
      </p>

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
              matchCount={fridgeKeywords.length > 0 ? fridgeMatchCounts.get(recipe.id) ?? 0 : 0}
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
