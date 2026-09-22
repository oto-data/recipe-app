import { CookpadRanking } from '@/components/CookpadRanking';
import { cookpadTop100Recipes } from '@/lib/cookpad';

export default function CookpadPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <CookpadRanking recipes={cookpadTop100Recipes} limit={100} />
    </main>
  );
}
