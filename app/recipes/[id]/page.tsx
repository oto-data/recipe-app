import { notFound } from 'next/navigation';
import { Clock3, Heart, ListChecks, Sparkles, TimerReset, ChefHat, BookOpen, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { recipeFromDb, recipes as sampleRecipes } from '@/lib/recipes';
import { DeleteRecipeButton } from '@/components/DeleteRecipeButton';
import { CookingTimer } from '@/components/CookingTimer';
import { CookedButton } from '@/components/CookedButton';
import { CopyRecipeButton } from '@/components/CopyRecipeButton';

async function getRecipe(id: string) {
  try {
    const recipe = await prisma.recipe.findUnique({ where: { id } });

    if (recipe) {
      return recipeFromDb(recipe);
    }
  } catch (error) {
    // fall back to the built-in sample recipes when the database schema is out of sync
  }

  return sampleRecipes.find((item) => item.id === id) ?? null;
}

export default async function RecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const recipe = await getRecipe(resolvedParams.id);

  if (!recipe) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <Link href="/recipes" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-accent transition hover:text-accentDark">
        <ArrowLeft className="h-4 w-4" />
        一覧へ戻る
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="overflow-hidden rounded-[32px] border border-border bg-surface shadow-soft">
          {recipe.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={recipe.image} alt={recipe.title} className="h-64 w-full object-cover sm:h-80" />
          ) : null}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#dcf7f7] via-[#c8f0ee] to-[#bfe9f5] p-6 sm:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.7),transparent_45%)]" />
            <div className="relative space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-white/70 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-accentDark backdrop-blur">
                  {recipe.category || 'レシピ'}
                </span>
                <span className="rounded-full border border-white/70 bg-white/70 px-3 py-1 text-sm font-medium text-textSecondary backdrop-blur">
                  {recipe.duration}
                </span>
                <span className="rounded-full border border-white/70 bg-white/70 px-3 py-1 text-sm font-medium text-textSecondary backdrop-blur">
                  {recipe.servings}
                </span>
              </div>

              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-2 text-sm font-semibold text-accentDark shadow-sm">
                  <ChefHat className="h-4 w-4" />
                  今日の一皿
                </div>
                <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-textPrimary sm:text-4xl">
                  {recipe.title}
                </h1>
                <p className="max-w-2xl text-base leading-8 text-textSecondary sm:text-lg">
                  {recipe.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {recipe.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-white/80 bg-white/80 px-3 py-2 text-sm font-semibold text-textSecondary shadow-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6 p-6 sm:p-8">
            <section className="rounded-[24px] border border-border bg-white p-5 shadow-sm">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-border bg-background p-4">
                  <p className="text-sm font-semibold text-textSecondary">分量</p>
                  <p className="mt-2 text-lg font-semibold text-textPrimary">{recipe.servings}</p>
                </div>
                <div className="rounded-2xl border border-border bg-background p-4">
                  <p className="text-sm font-semibold text-textSecondary">所要時間</p>
                  <p className="mt-2 text-lg font-semibold text-textPrimary">{recipe.duration}</p>
                </div>
              </div>
            </section>

            <section className="rounded-[24px] border border-border bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-2xl bg-[#e6fafa] p-2 text-accent">
                  <ListChecks className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-textPrimary">材料</h2>
                  <p className="text-sm text-textSecondary">必要な食材をチェックしながら準備できます。</p>
                </div>
              </div>
              <div className="space-y-3">
                {recipe.ingredients.map((item) => (
                  <label key={item} className="flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3 transition hover:border-accent">
                    <input type="checkbox" className="h-4 w-4 accent-accent" />
                    <span className="text-base text-textPrimary">{item}</span>
                  </label>
                ))}
              </div>
            </section>

            <section className="rounded-[24px] border border-border bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-2xl bg-[#e6fafa] p-2 text-accent">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-textPrimary">作り方</h2>
                  <p className="text-sm text-textSecondary">一歩ずつ丁寧に進められるように整理しました。</p>
                </div>
              </div>
              <div className="space-y-4">
                {recipe.steps.map((step, index) => (
                  <div key={`${step.label}-${index}`} className="rounded-[22px] border border-border bg-background p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent text-base font-bold text-white">
                        {index + 1}
                      </div>
                      <div>
                        {step.label ? (
                          <h3 className="mb-2 text-lg font-semibold text-textPrimary">{step.label}</h3>
                        ) : null}
                        <p className="text-base leading-8 text-textSecondary">{step.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[24px] border border-border bg-[#f2fcfc] p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-3">
                <div className="rounded-2xl bg-white p-2 text-accent">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-semibold text-textPrimary">メモ・コツ</h2>
              </div>
              <p className="text-base leading-8 text-textSecondary">{recipe.notes}</p>
            </section>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-[28px] border border-border bg-surface p-6 shadow-soft">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-textPrimary">アクション</h2>
              <div className="rounded-2xl bg-[#e6fafa] p-2 text-accent">
                <TimerReset className="h-5 w-5" />
              </div>
            </div>
            <div className="space-y-3 text-sm leading-7 text-textSecondary">
              <div className="flex items-start gap-2">
                <Heart className="mt-1 h-4 w-4 text-accent" />
                <p>気に入ったレシピをお気に入りとして整理できます。</p>
              </div>
              <div className="flex items-start gap-2">
                <Clock3 className="mt-1 h-4 w-4 text-accent" />
                <p>調理タイマーの候補を一覧からすぐ確認できます。</p>
              </div>
              <div className="flex items-start gap-2">
                <ListChecks className="mt-1 h-4 w-4 text-accent" />
                <p>材料チェックで買い物や下準備を効率化できます。</p>
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-3">
              <Link
                href={`/recipes/${recipe.id}/edit`}
                className="inline-flex w-full items-center justify-center rounded-full bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accentDark"
              >
                レシピを編集
              </Link>
              <CopyRecipeButton recipe={recipe} />
              {recipe.sourceUrl ? (
                <a
                  href={recipe.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center rounded-full border border-border bg-white px-4 py-3 text-sm font-semibold text-textPrimary transition hover:border-accent hover:text-accent"
                >
                  出典を見る
                </a>
              ) : null}
              <DeleteRecipeButton recipeId={recipe.id} />
            </div>
          </div>

          <CookedButton
            recipeId={recipe.id}
            initialLastCookedAt={recipe.lastCookedAt}
            initialCookedCount={recipe.cookedCount}
          />

          <CookingTimer steps={recipe.steps} />

          <div className="rounded-[28px] border border-border bg-surface p-6 shadow-soft">
            <h2 className="mb-4 text-lg font-semibold text-textPrimary">関連タグ</h2>
            <div className="flex flex-wrap gap-2">
              {recipe.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-background px-3 py-2 text-sm text-textSecondary">{tag}</span>
              ))}
            </div>
            <div className="mt-5 rounded-2xl border border-border bg-background p-4 text-sm leading-7 text-textSecondary">
              <p>カテゴリやタグから、似たレシピを見つけやすくなっています。</p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
