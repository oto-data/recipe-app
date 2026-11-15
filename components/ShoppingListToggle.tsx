'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { getShoppingRecipeIds, toggleShoppingRecipeId } from '@/lib/shoppingList';

type ShoppingListToggleProps = {
  recipeId: string;
};

export function ShoppingListToggle({ recipeId }: ShoppingListToggleProps) {
  const [selected, setSelected] = useState(false);

  useEffect(() => {
    setSelected(getShoppingRecipeIds().includes(recipeId));
  }, [recipeId]);

  const handleToggle = () => {
    setSelected(toggleShoppingRecipeId(recipeId));
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleToggle}
        className={`inline-flex w-full items-center justify-center gap-2 rounded-full border px-4 py-3 text-sm font-semibold transition ${
          selected
            ? 'border-accent bg-[#e6fafa] text-accentDark'
            : 'border-border bg-white text-textPrimary hover:border-accent hover:text-accent'
        }`}
      >
        <ShoppingCart className="h-4 w-4" />
        {selected ? '買い物リストに追加済み（タップで外す）' : '買い物リストに追加'}
      </button>
      {selected ? (
        <Link
          href="/shopping-list"
          className="block text-center text-sm font-semibold text-accent transition hover:text-accentDark"
        >
          買い物リストを見る →
        </Link>
      ) : null}
    </div>
  );
}
