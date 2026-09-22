import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { recipes as sampleRecipes } from '@/lib/recipes';

function formatRecipe(recipe: any) {
  return {
    ...recipe,
    category: recipe.category ?? '',
    favorite: Boolean(recipe.favorite),
    tags: recipe.tags ? recipe.tags.split(',').filter(Boolean) : [],
    ingredients: recipe.ingredients ? JSON.parse(recipe.ingredients) : [],
    steps: recipe.steps ? JSON.parse(recipe.steps) : []
  };
}

function validateRecipePayload(body: any) {
  return (
    body &&
    typeof body.title === 'string' &&
    typeof body.description === 'string' &&
    typeof body.duration === 'string' &&
    typeof body.servings === 'string' &&
    typeof body.notes === 'string' &&
    (body.category === undefined || typeof body.category === 'string') &&
    (body.favorite === undefined || typeof body.favorite === 'boolean') &&
    Array.isArray(body.ingredients) &&
    Array.isArray(body.steps)
  );
}

export async function GET() {
  try {
    const recipes = await prisma.recipe.findMany({ orderBy: { createdAt: 'desc' } });

    if (recipes.length === 0) {
      return NextResponse.json(sampleRecipes.map((recipe) => ({ ...recipe, favorite: Boolean(recipe.favorite) })));
    }

    return NextResponse.json(recipes.map(formatRecipe));
  } catch (error) {
    return NextResponse.json(sampleRecipes.map((recipe) => ({ ...recipe, favorite: Boolean(recipe.favorite) })));
  }
}

export async function POST(request: Request) {
  let body: any;

  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!validateRecipePayload(body)) {
    return NextResponse.json({ error: 'Invalid recipe data' }, { status: 400 });
  }

  try {
    const recipe = await prisma.recipe.create({
      data: {
        title: body.title,
        description: body.description,
        duration: body.duration,
        servings: body.servings,
        notes: body.notes,
        tags: Array.isArray(body.tags) ? body.tags.join(',') : '',
        category: typeof body.category === 'string' ? body.category : '',
        favorite: typeof body.favorite === 'boolean' ? body.favorite : false,
        ingredients: JSON.stringify(body.ingredients),
        steps: JSON.stringify(body.steps)
      }
    });

    return NextResponse.json(formatRecipe(recipe), { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create recipe' }, { status: 500 });
  }
}
