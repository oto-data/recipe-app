'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, Sparkles, Star, Filter } from 'lucide-react';
import { RecipeCard } from '@/components/RecipeCard';
import { StatusBanner } from '@/components/StatusBanner';
import { categories, tags } from '@/lib/recipes';
import type { Recipe } from '@/lib/recipes';

export function RecipeList() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusVariant, setStatusVariant] = useState<'success' | 'error' | 'info'>('success');

  useEffect(() => {
    let isMounted = true;

    fetch('/api/recipes')
      .then(async (response) => {
        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          throw new Error(payload?.error ?? 'レシピの取得に失敗しました。');
        }
        return response.json();
      })
      .then((data) => {
        if (isMounted) {
          setRecipes(data);
          setError(null);
        }
      })
      .catch((loadError) => {
        if (isMounted) {
          setError(loadError?.message ?? 'レシピの取得に失敗しました。');
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
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

      const matchesCategory = selectedCategory === 'all' || recipe.category === selectedCategory;
      const matchesFavorite = !favoriteOnly || Boolean(recipe.favorite);

      return matchesQuery && matchesTags && matchesCategory && matchesFavorite;
    });
  }, [favoriteOnly, query, recipes, selectedCategory, selectedTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags((current) =>
      current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]
    );
  };

  const toggleFavorite = (recipeId: string, favorite: boolean) => {
    setRecipes((current) => current.map((recipe) => (recipe.id === recipeId ? { ...recipe, favorite } : recipe)));
  };

  return (
    <div className="rounded-[28px] border border-border bg-surface p-6 shadow-soft">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-accentDark">レシピ一覧</p>
          <h1 className="mt-3 text-3xl font-semibold text-textPrimary sm:text-4xl">保存済みレシピ</h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-textSecondary">
            これまでに追加したレシピを一覧から確認、編集、検索できます。
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-border bg-background p-5">
            <label htmlFor="recipe-search" className="text-sm font-medium text-textSecondary">
              レシピ検索
            </label>
            <div className="mt-3 flex items-center gap-3 rounded-3xl border border-border bg-white px-4 py-3">
              <Search className="h-5 w-5 text-textSecondary" />
              <input
                id="recipe-search"
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
                <p className="text-sm font-medium text-textSecondary">カテゴリ</p>
                <p className="mt-1 text-sm text-textSecondary">気になるジャンルだけをピックアップ</p>
              </div>
              <Filter className="h-5 w-5 text-accent" />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`rounded-full border px-4 py-2 text-sm transition ${selectedCategory === 'all' ? 'border-accent bg-accent text-white' : 'border-border bg-white text-textPrimary hover:border-accent hover:text-accent'}`}
              >
                すべて
              </button>
              {categories.map((category) => {
                const active = selectedCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={`rounded-full border px-4 py-2 text-sm transition ${active ? 'border-accent bg-accent text-white' : 'border-border bg-white text-textPrimary hover:border-accent hover:text-accent'}`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-background p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-textSecondary">タグで絞り込み</p>
                <p className="mt-1 text-sm text-textSecondary">複数選択できます</p>
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
                    className={`rounded-full border px-4 py-2 text-sm transition ${active ? 'border-accent bg-accent text-white' : 'border-border bg-white text-textPrimary hover:border-accent hover:text-accent'}`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-border bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-textSecondary">フィルター結果</p>
                <p className="mt-2 text-2xl font-semibold text-textPrimary">{filteredRecipes.length} 件</p>
              </div>
              <button
                type="button"
                onClick={() => setFavoriteOnly((current) => !current)}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition ${favoriteOnly ? 'border-[#ff8fa3] bg-[#fff0f3] text-[#e05a75]' : 'border-border bg-background text-textPrimary'}`}
              >
                <Star className={`h-4 w-4 ${favoriteOnly ? 'fill-accent' : ''}`} />
                {favoriteOnly ? 'お気に入りのみ' : 'お気に入り表示'}
              </button>
            </div>
            <div className="mt-4 min-h-[120px] rounded-3xl border border-border bg-background p-4 text-sm text-textSecondary">
              {selectedTags.length === 0 ? 'タグは未選択です。' : selectedTags.join(' / ')}
              {query ? <p className="mt-3">検索キーワード: 「{query}」</p> : null}
              {selectedCategory !== 'all' ? <p className="mt-3">カテゴリ: {selectedCategory}</p> : null}
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-white p-5">
            <p className="text-sm font-medium text-textSecondary">操作</p>
            <div className="mt-4 space-y-3 text-sm text-textSecondary">
              <p>・カードのハートでお気に入り登録できます。</p>
              <p>・カードをタップすると詳細が開きます。</p>
              <p>・材料・手順は詳細画面で確認できます。</p>
            </div>
          </div>
        </div>
      </div>

      {statusMessage ? (
        <div className="mt-6">
          <StatusBanner message={statusMessage} variant={statusVariant} />
        </div>
      ) : null}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="rounded-3xl border border-border bg-white p-6 text-center text-textSecondary">
            読み込み中...
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-border bg-red-50 p-6 text-center text-red-700">
            {error}
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="rounded-3xl border border-border bg-white p-6 text-center text-textSecondary">
            条件に該当するレシピが見つかりませんでした。
          </div>
        ) : (
          filteredRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onDeleted={() => {
                setRecipes((current) => current.filter((item) => item.id !== recipe.id));
                setStatusVariant('success');
                setStatusMessage('レシピが正常に削除されました。');
                setTimeout(() => setStatusMessage(null), 4000);
              }}
              onError={(message) => {
                setStatusVariant('error');
                setStatusMessage(message);
                setTimeout(() => setStatusMessage(null), 5000);
              }}
              onToggleFavorite={(recipeId, favorite) => {
                toggleFavorite(recipeId, favorite);
                setStatusVariant('success');
                setStatusMessage(favorite ? 'お気に入りに追加しました。' : 'お気に入りを解除しました。');
                setTimeout(() => setStatusMessage(null), 3000);
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
