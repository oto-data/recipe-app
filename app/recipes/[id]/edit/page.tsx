import Link from 'next/link';
import { notFound } from 'next/navigation';
import { EditRecipeForm } from '@/components/EditRecipeForm';
import { prisma } from '@/lib/prisma';
import { recipeFromDb } from '@/lib/recipes';

async function getRecipe(id: string) {
  const recipe = await prisma.recipe.findUnique({ where: { id } });
  return recipe ? recipeFromDb(recipe) : null;
}

export default async function EditRecipePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const recipe = await getRecipe(resolvedParams.id);

  if (!recipe) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-[28px] border border-border bg-surface p-6 shadow-soft">
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-accentDark">レシピ編集</p>
          <h1 className="mt-3 text-3xl font-semibold text-textPrimary sm:text-4xl">レシピを編集する</h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-textSecondary">
            既存のレシピ内容を編集して、情報を最新の状態に保ちましょう。
          </p>
        </div>

        <EditRecipeForm recipe={recipe} />

        <div className="mt-6 flex gap-4 flex-wrap">
          <Link href={`/recipes/${recipe.id}`} className="rounded-full border border-border bg-white px-5 py-3 text-sm font-semibold text-textPrimary transition hover:border-accent">
            詳細に戻る
          </Link>
          <Link href="/recipes" className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accentDark">
            レシピ一覧へ戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
