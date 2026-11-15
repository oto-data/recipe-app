'use client';

import { useRouter } from 'next/navigation';
import { Copy } from 'lucide-react';
import type { Recipe } from '@/lib/recipes';

type CopyRecipeButtonProps = {
  recipe: Recipe;
};

/**
 * Copies the recipe into the new-recipe draft (same shape RecipeForm restores
 * from `recipe-draft-new`) and navigates to /recipes/new.
 * id / lastCookedAt / cookedCount are intentionally NOT carried over.
 */
export function CopyRecipeButton({ recipe }: CopyRecipeButtonProps) {
  const router = useRouter();

  const handleCopy = () => {
    const draft = {
      title: recipe.title,
      description: recipe.description,
      category: recipe.category,
      duration: recipe.duration,
      servings: recipe.servings,
      ingredients: recipe.ingredients,
      steps: recipe.steps,
      notes: recipe.notes,
      tags: recipe.tags,
      image: recipe.image ?? '',
      sourceUrl: recipe.sourceUrl ?? ''
    };
    try {
      window.localStorage.setItem('recipe-draft-new', JSON.stringify(draft));
    } catch {
      // storage unavailable: still navigate; the form just starts empty
    }
    router.push('/recipes/new');
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-white px-4 py-3 text-sm font-semibold text-textPrimary transition hover:border-accent hover:text-accent"
    >
      <Copy className="h-4 w-4" />
      コピーして新規作成
    </button>
  );
}
