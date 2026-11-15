'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ShoppingCart, Trash2, X } from 'lucide-react';
import type { Recipe } from '@/lib/recipes';
import {
  getCheckedItems,
  getShoppingRecipeIds,
  setCheckedItems,
  setShoppingRecipeIds
} from '@/lib/shoppingList';

type AggregatedItem = {
  text: string;
  recipeTitles: string[];
};

export default function ShoppingListPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [checked, setChecked] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setSelectedIds(getShoppingRecipeIds());
    setChecked(getCheckedItems());
    fetch('/api/recipes')
      .then((response) => response.json())
      .then((data) => setRecipes(Array.isArray(data) ? data : []))
      .catch(() => setRecipes([]))
      .finally(() => setIsLoading(false));
  }, []);

  const selectedRecipes = useMemo(
    () => selectedIds
      .map((id) => recipes.find((recipe) => recipe.id === id))
      .filter((recipe): recipe is Recipe => Boolean(recipe)),
    [selectedIds, recipes]
  );

  /** Identical ingredient strings are merged; recipe titles are annotated. */
  const items = useMemo<AggregatedItem[]>(() => {
    const map = new Map<string, AggregatedItem>();
    for (const recipe of selectedRecipes) {
      for (const raw of recipe.ingredients) {
        const text = raw.trim();
        if (!text) continue;
        const existing = map.get(text);
        if (existing) {
          if (!existing.recipeTitles.includes(recipe.title)) {
            existing.recipeTitles.push(recipe.title);
          }
        } else {
          map.set(text, { text, recipeTitles: [recipe.title] });
        }
      }
    }
    return [...map.values()];
  }, [selectedRecipes]);

  const toggleChecked = (text: string) => {
    setChecked((current) => {
      const next = current.includes(text) ? current.filter((item) => item !== text) : [...current, text];
      setCheckedItems(next);
      return next;
    });
  };

  const removeRecipe = (id: string) => {
    const next = selectedIds.filter((item) => item !== id);
    setSelectedIds(next);
    setShoppingRecipeIds(next);
  };

  const clearAll = () => {
    setSelectedIds([]);
    setShoppingRecipeIds([]);
    setChecked([]);
    setCheckedItems([]);
  };

  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-6 sm:px-6">
      <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-accent transition hover:text-accentDark">
        <ArrowLeft className="h-4 w-4" />
        トップへ戻る
      </Link>

      <header className="mb-6 flex items-center gap-3">
        <div className="rounded-2xl bg-[#e6fafa] p-3 text-accent">
          <ShoppingCart className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-textPrimary">買い物リスト</h1>
          <p className="text-sm text-textSecondary">選んだレシピの材料をまとめたチェックリストです。</p>
        </div>
      </header>

      {isLoading ? (
        <div className="rounded-3xl border border-border bg-surface p-6 text-center text-textSecondary">
          読み込み中...
        </div>
      ) : selectedIds.length === 0 ? (
        <div className="rounded-3xl border border-border bg-surface p-8 text-center">
          <p className="text-base font-semibold text-textPrimary">まだレシピが選ばれていません</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-textSecondary">
            レシピの詳細画面で「買い物リストに追加」を押すと、そのレシピの材料がここにまとまります。
          </p>
          <Link
            href="/"
            className="mt-5 inline-flex items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accentDark"
          >
            レシピを探す
          </Link>
        </div>
      ) : (
        <>
          <section className="mb-5 rounded-3xl border border-border bg-surface p-5">
            <p className="mb-3 text-sm font-semibold text-textSecondary">対象レシピ（{selectedRecipes.length} 件）</p>
            <div className="flex flex-wrap gap-2">
              {selectedRecipes.map((recipe) => (
                <span
                  key={recipe.id}
                  className="inline-flex items-center gap-2 rounded-full bg-background px-3 py-1.5 text-sm font-semibold text-textPrimary"
                >
                  {recipe.title}
                  <button
                    type="button"
                    onClick={() => removeRecipe(recipe.id)}
                    aria-label={`${recipe.title} を買い物リストから外す`}
                    className="text-textSecondary transition hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </span>
              ))}
            </div>
            {selectedIds.length !== selectedRecipes.length ? (
              <p className="mt-3 text-xs text-textSecondary">
                ※ 見つからなかったレシピが {selectedIds.length - selectedRecipes.length} 件あります（削除された可能性があります）。
              </p>
            ) : null}
          </section>

          <section className="rounded-3xl border border-border bg-surface p-5">
            <p className="mb-4 text-sm font-semibold text-textSecondary">
              材料 {items.length} 件（買えたらチェック）
            </p>
            <div className="space-y-3">
              {items.map((item) => {
                const isChecked = checked.includes(item.text);
                return (
                  <label
                    key={item.text}
                    className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-background px-4 py-3 transition hover:border-accent"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleChecked(item.text)}
                      className="mt-1 h-4 w-4 shrink-0 accent-accent"
                    />
                    <span className="min-w-0">
                      <span className={`block text-base ${isChecked ? 'text-textSecondary line-through' : 'text-textPrimary'}`}>
                        {item.text}
                      </span>
                      <span className="mt-0.5 block text-xs text-textSecondary">
                        {item.recipeTitles.join(' / ')}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </section>

          <button
            type="button"
            onClick={clearAll}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100"
          >
            <Trash2 className="h-4 w-4" />
            選択をクリア
          </button>
        </>
      )}
    </main>
  );
}
