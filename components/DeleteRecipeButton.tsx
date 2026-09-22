'use client';

import { useRouter } from 'next/navigation';

export function DeleteRecipeButton({ recipeId }: { recipeId: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    const confirmed = window.confirm('このレシピを削除してもよろしいですか？');
    if (!confirmed) {
      return;
    }

    const response = await fetch(`/api/recipes/${recipeId}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      router.push('/recipes');
    } else {
      window.alert('削除に失敗しました。');
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="inline-flex w-full items-center justify-center rounded-full border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100"
    >
      レシピを削除
    </button>
  );
}
