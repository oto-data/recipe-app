import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function formatRecipe(recipe: any) {
  return {
    ...recipe,
    category: recipe.category ?? '',
    favorite: Boolean(recipe.favorite),
    image: recipe.image ?? '',
    sourceUrl: recipe.sourceUrl ?? '',
    lastCookedAt: recipe.lastCookedAt ? new Date(recipe.lastCookedAt).toISOString() : null,
    cookedCount: recipe.cookedCount ?? 0,
    tags: recipe.tags ? recipe.tags.split(',').filter(Boolean) : [],
    ingredients: recipe.ingredients ? JSON.parse(recipe.ingredients) : [],
    steps: recipe.steps ? JSON.parse(recipe.steps) : []
  };
}

export async function POST(request: Request, context: any) {
  const { params } = context;

  try {
    const recipe = await prisma.recipe.update({
      where: { id: params.id },
      data: {
        lastCookedAt: new Date(),
        cookedCount: { increment: 1 }
      }
    });

    return NextResponse.json(formatRecipe(recipe));
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to record cooking' }, { status: 500 });
  }
}
