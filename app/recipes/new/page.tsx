'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RecipeForm, type RecipeFormValues } from '@/components/RecipeForm';

export default function NewRecipePage() {
  const router = useRouter();

  const handleSubmit = async (formValues: RecipeFormValues) => {
    const response = await fetch('/api/recipes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formValues)
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(payload?.error ?? 'レシピの保存に失敗しました。');
    }

    router.push(`/recipes/${payload.id}`);
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-[28px] border border-border bg-surface p-6 shadow-soft">
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-accentDark">レシピ登録</p>
          <h1 className="mt-3 text-3xl font-semibold text-textPrimary sm:text-4xl">新しいレシピを追加する</h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-textSecondary">
            材料や手順を自由に追加して、自分のレシピアルバムを作ってみましょう。
          </p>
        </div>

        <RecipeForm submitLabel="レシピを保存" onSubmit={handleSubmit} />

        <div className="mt-6">
          <Link href="/recipes" className="text-sm font-semibold text-accent transition hover:text-accentDark">
            保存済みレシピ一覧へ戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
