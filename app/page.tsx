'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { RecipeCard } from '../components/RecipeCard';
import { CookpadRanking } from '../components/CookpadRanking';
import { tags } from '../lib/recipes';
import { cookpadTop100Recipes } from '../lib/cookpad';
import type { Recipe } from '../lib/recipes';

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
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

      return matchesQuery && matchesTags;
    });
  }, [query, selectedTags, recipes]);

  const toggleTag = (tag: string) => {
    setSelectedTags((current) =>
      current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]
    );
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-[28px] border border-border bg-surface p-6 shadow-soft">
        <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.24em] text-accentDark">レシピノート</p>
            <h1 className="text-3xl font-semibold leading-tight text-textPrimary sm:text-4xl">家族のためのレシピ管理</h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-textSecondary">
              お気に入りのレシピを残して、買い物や調理をスムーズに。スマホでも読みやすいレイアウト。
            </p>
          </div>
          <Link
            href="#new-recipe"
            className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-accentDark"
          >
            新規レシピを追加
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-border bg-background p-5">
              <label htmlFor="search" className="text-sm font-medium text-textSecondary">キーワード検索</label>
              <div className="mt-3 flex items-center gap-3 rounded-3xl border border-border bg-white px-4 py-3">
                <Search className="h-5 w-5 text-textSecondary" />
                <input
                  id="search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="レシピ名・材料・タグで検索"
                  className="w-full border-none bg-transparent text-base text-textPrimary outline-none placeholder:text-textSecondary"
                />
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-background p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-textSecondary">タグで絞り込み</p>
                  <p className="mt-1 text-sm text-textSecondary">複数選択可能</p>
                </div>
                <Sparkles className="h-5 w-5 text-accent" />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {tags.map((tag) => {
                  const active = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`rounded-full border px-4 py-2 text-sm transition ${
                        active
                          ? 'border-accent bg-accent text-white'
                          : 'border-border bg-white text-textPrimary hover:border-accent hover:text-accent'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-background p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-textSecondary">最近のレシピ</p>
                <h2 className="mt-1 text-xl font-semibold text-textPrimary">作ったばかり</h2>
              </div>
              <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase text-white">New</span>
            </div>
            <div className="space-y-4">
              {recipes.slice(0, 3).map((recipe) => (
                <article key={recipe.id} className="rounded-3xl border border-border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-textPrimary">{recipe.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-textSecondary">{recipe.description}</p>
                    </div>
                    <div className="text-right text-sm text-textSecondary">
                      <p>{recipe.duration}</p>
                      <p className="mt-1">{recipe.servings}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {recipe.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-background px-3 py-1 text-xs font-semibold text-textSecondary">{tag}</span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <CookpadRanking recipes={cookpadTop100Recipes} />
      </section>

      <section id="new-recipe" className="mt-10 rounded-[28px] border border-border bg-surface p-6 shadow-soft">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-accentDark">まずはここから</p>
            <h2 className="mt-3 text-2xl font-semibold text-textPrimary sm:text-3xl">レシピを追加・編集</h2>
            <p className="mt-3 max-w-2xl text-base leading-8 text-textSecondary">
              料理名や材料、手順を入力して、自分だけのレシピ集を育てましょう。
            </p>
          </div>
          <Link href="/recipes/new" className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-accentDark">
            新規レシピを登録
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <h3 className="text-xl font-semibold text-textPrimary">検索結果</h3>
            <p className="mt-2 text-sm text-textSecondary">{filteredRecipes.length} 件のレシピが見つかりました。</p>
            <div className="mt-6 grid gap-4">
              {filteredRecipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-background p-5">
            <h3 className="text-lg font-semibold text-textPrimary">今のフィルター</h3>
            <div className="mt-4 min-h-[120px] rounded-3xl border border-border bg-white p-4 text-sm text-textSecondary">
              {selectedTags.length === 0 ? 'タグは未選択です。' : selectedTags.join(' / ')}
              {query && <p className="mt-3">検索キーワード: 「{query}」</p>}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
