import Link from 'next/link';
import { ArrowLeft, BookOpen, Clock3, ListChecks, Sparkles } from 'lucide-react';
import { notFound } from 'next/navigation';
import { cookpadTop100Recipes } from '@/lib/cookpad';

export default function CookpadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (async () => {
    const resolvedParams = await params;
    const recipe = cookpadTop100Recipes.find((item) => item.rank.toString() === resolvedParams.id);

    if (!recipe) {
      notFound();
    }

    return (
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <Link href="/cookpad" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-accent transition hover:text-accentDark">
          <ArrowLeft className="h-4 w-4" />
          ランキングへ戻る
        </Link>

        <div className="overflow-hidden rounded-[32px] border border-border bg-surface shadow-soft">
          <div className="bg-gradient-to-br from-[#f8efe1] via-[#f4e4d2] to-[#efe0ca] p-6 sm:p-8">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-2 text-sm font-semibold text-accentDark shadow-sm">
                <Sparkles className="h-4 w-4" />
                Cookpadランキング #{recipe.rank}
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-textPrimary sm:text-4xl">{recipe.title}</h1>
              <p className="max-w-2xl text-base leading-8 text-textSecondary sm:text-lg">{recipe.description}</p>
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
            <section className="grid gap-3 rounded-[24px] border border-border bg-white p-5 shadow-sm sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-background p-4">
                <p className="text-sm font-semibold text-textSecondary">分量</p>
                <p className="mt-2 text-lg font-semibold text-textPrimary">{recipe.servings}</p>
              </div>
              <div className="rounded-2xl border border-border bg-background p-4">
                <p className="text-sm font-semibold text-textSecondary">所要時間</p>
                <p className="mt-2 text-lg font-semibold text-textPrimary">{recipe.duration}</p>
              </div>
            </section>

            <section className="rounded-[24px] border border-border bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-2xl bg-[#fff7ee] p-2 text-accent">
                  <ListChecks className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-textPrimary">特徴</h2>
                  <p className="text-sm text-textSecondary">定番の人気メニューとして親しまれる一皿です。</p>
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-background p-4 text-base leading-8 text-textSecondary">
                家庭で作りやすく、忙しい日でも手軽に取り組めるメニューです。食材の組み合わせや味付けのコツを参考にしながら、オリジナルのアレンジも楽しめます。
              </div>
            </section>

            <section className="rounded-[24px] border border-border bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-2xl bg-[#fff7ee] p-2 text-accent">
                  <BookOpen className="h-5 w-4" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-textPrimary">作り方のポイント</h2>
                  <p className="text-sm text-textSecondary">人気の理由がひと目で分かるように整理しました。</p>
                </div>
              </div>
              <div className="space-y-3 text-base leading-8 text-textSecondary">
                <div className="rounded-2xl border border-border bg-background p-4">
                  <div className="font-semibold text-textPrimary">1. 材料を準備する</div>
                  <p className="mt-2">必要な食材を揃えて、下準備をしておくとスムーズに仕上げられます。</p>
                </div>
                <div className="rounded-2xl border border-border bg-background p-4">
                  <div className="font-semibold text-textPrimary">2. 火加減を調整する</div>
                  <p className="mt-2">味のバランスを整えながら、焦げすぎないように丁寧に仕上げましょう。</p>
                </div>
                <div className="rounded-2xl border border-border bg-background p-4">
                  <div className="font-semibold text-textPrimary">3. お好みでアレンジする</div>
                  <p className="mt-2">香味野菜や調味料を足して、自分好みの味に仕上げるのもおすすめです。</p>
                </div>
              </div>
            </section>

            <section className="rounded-[24px] border border-border bg-[#fffaf4] p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-3">
                <div className="rounded-2xl bg-white p-2 text-accent">
                  <Clock3 className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-semibold text-textPrimary">おすすめの使い方</h2>
              </div>
              <p className="text-base leading-8 text-textSecondary">
                仕事帰りや休日の食卓に取り入れやすいメニューです。気軽に作れて、家族にも好評です。
              </p>
            </section>
          </div>
        </div>
      </main>
    );
  })();
}
