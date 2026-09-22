'use client';

import { useRouter } from 'next/navigation';
import { RecipeForm, type RecipeFormValues } from '@/components/RecipeForm';
import type { Recipe } from '@/lib/recipes';

type EditRecipeFormProps = {
  recipe: Recipe;
};

export function EditRecipeForm({ recipe }: EditRecipeFormProps) {
  const router = useRouter();

  const handleSubmit = async (formValues: RecipeFormValues) => {
    const response = await fetch(`/api/recipes/${recipe.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formValues)
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(payload?.error ?? 'レシピの更新に失敗しました。');
    }

    router.push(`/recipes/${payload.id}`);
  };

  return <RecipeForm initialValues={recipe} submitLabel="更新する" onSubmit={handleSubmit} />;
}
