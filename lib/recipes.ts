import type { Recipe as PrismaRecipe } from '@prisma/client';

export type RecipeStep = {
  label: string;
  description: string;
};

export type Recipe = {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  duration: string;
  servings: string;
  ingredients: string[];
  steps: RecipeStep[];
  notes: string;
  favorite?: boolean;
};

export type RecipeFormValues = Omit<Recipe, 'id'>;

export const categories = ['主食', 'おかず', 'スイーツ', '軽食', 'ドリンク', 'その他'];

export const tags = ['時短', '作り置き', '節約', '和食', '洋食', 'チーズ', 'ヘルシー', 'お弁当', '冷凍可'];

export type CategoryMeta = {
  emoji: string;
  /** Full literal Tailwind gradient classes so they are picked up by the compiler. */
  gradient: string;
};

export const categoryMeta: Record<string, CategoryMeta> = {
  主食: { emoji: '🍚', gradient: 'from-[#ffe9a8] to-[#ffd166]' },
  おかず: { emoji: '🍳', gradient: 'from-[#b8f1e4] to-[#5ec8b8]' },
  スイーツ: { emoji: '🍰', gradient: 'from-[#ffd6e0] to-[#ff9eb5]' },
  軽食: { emoji: '🥪', gradient: 'from-[#d9f2c2] to-[#a5d66d]' },
  ドリンク: { emoji: '🥤', gradient: 'from-[#c2e8ff] to-[#6db9e8]' },
  その他: { emoji: '📦', gradient: 'from-[#e2e0ff] to-[#a9a3e0]' }
};

export const defaultCategoryMeta: CategoryMeta = {
  emoji: '🍽️',
  gradient: 'from-[#c9f2f2] to-[#7fd1d9]'
};

export function getCategoryMeta(category: string): CategoryMeta {
  return categoryMeta[category] ?? defaultCategoryMeta;
}

export const durationOptions = ['5分', '10分', '15分', '30分', '45分', '1時間〜'];
export const servingsOptions = ['1人前', '2人前', '3人前', '4人前〜'];

export function recipeFromDb(recipe: PrismaRecipe): Recipe {
  return {
    id: recipe.id,
    title: recipe.title,
    description: recipe.description,
    category: recipe.category ?? '',
    duration: recipe.duration,
    servings: recipe.servings,
    notes: recipe.notes,
    favorite: Boolean(recipe.favorite),
    tags: recipe.tags ? recipe.tags.split(',').filter(Boolean) : [],
    ingredients: recipe.ingredients ? JSON.parse(recipe.ingredients) : [],
    steps: recipe.steps ? JSON.parse(recipe.steps) : []
  };
}

export const recipes: Recipe[] = [
  {
    id: '1',
    title: '鶏むね肉の照り焼き',
    description: 'しっとり仕上げるやさしい味の和風照り焼き。',
    category: 'おかず',
    tags: ['時短', '鶏肉', '和食'],
    duration: '25分',
    servings: '2人前',
    ingredients: ['鶏むね肉 1枚', '醤油 大さじ2', 'みりん 大さじ2', '砂糖 大さじ1', '生姜 1片'],
    steps: [
      { label: '鶏肉を切る', description: '鶏むね肉は厚さを均一にし食べやすい大きさに切る。' },
      { label: '調味料を混ぜる', description: '醤油、みりん、砂糖、生姜のすりおろしを混ぜ合わせる。' },
      { label: '焼く', description: 'フライパンで鶏肉を焼き、調味料を加えて煮絡める。' }
    ],
    notes: '照り焼きのたれは焦がさないように弱火で仕上げるときれいに仕上がります。'
  },
  {
    id: '2',
    title: 'トマトたっぷり鶏のチーズ焼き',
    description: 'トマトの酸味とチーズの濃厚さが楽しめる一品。',
    category: 'おかず',
    tags: ['作り置き', '洋食', 'チーズ'],
    duration: '40分',
    servings: '2人前',
    ingredients: ['鶏もも肉 300g', 'トマト 2個', 'ピザ用チーズ 100g', 'オリーブオイル 大さじ1', 'バジル 少々'],
    steps: [
      { label: '鶏肉を下味', description: '鶏肉に塩胡椒をし、オリーブオイルで軽く焼き目をつける。' },
      { label: 'トマトを並べる', description: '耐熱皿に鶏肉とスライストマトを並べる。' },
      { label: 'チーズをのせる', description: 'ピザ用チーズをたっぷりのせ、オーブンで焼き上げる。' }
    ],
    notes: '冷めてもおいしいので、作り置きにも向いています。お好みでバジルを仕上げに散らして。'
  }
];
