import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { recipes as sampleRecipes } from '@/lib/recipes';

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

function validateRecipePayload(body: any) {
  return (
    body &&
    typeof body.title === 'string' &&
    body.title.trim().length > 0 &&
    typeof body.description === 'string' &&
    typeof body.duration === 'string' &&
    typeof body.servings === 'string' &&
    typeof body.notes === 'string' &&
    (body.category === undefined || typeof body.category === 'string') &&
    (body.favorite === undefined || typeof body.favorite === 'boolean') &&
    (body.image === undefined || typeof body.image === 'string') &&
    (body.sourceUrl === undefined || typeof body.sourceUrl === 'string') &&
    Array.isArray(body.ingredients) &&
    Array.isArray(body.steps)
  );
}

export async function GET(request: Request, context: any) {
  const { params } = context;

  try {
    const recipe = await prisma.recipe.findUnique({ where: { id: params.id } });

    if (!recipe) {
      const fallbackRecipe = sampleRecipes.find((item) => item.id === params.id);

      if (fallbackRecipe) {
        return NextResponse.json({ ...fallbackRecipe, favorite: Boolean(fallbackRecipe.favorite) });
      }

      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    return NextResponse.json(formatRecipe(recipe));
  } catch (error) {
    const fallbackRecipe = sampleRecipes.find((item) => item.id === params.id);

    if (fallbackRecipe) {
      return NextResponse.json({ ...fallbackRecipe, favorite: Boolean(fallbackRecipe.favorite) });
    }

    return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
  }
}

export async function PATCH(request: Request, context: any) {
  const { params } = context;
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
    const recipe = await prisma.recipe.update({
      where: { id: params.id },
      data: {
        title: body.title,
        description: body.description,
        duration: body.duration,
        servings: body.servings,
        notes: body.notes,
        tags: Array.isArray(body.tags) ? body.tags.join(',') : '',
        category: typeof body.category === 'string' ? body.category : '',
        favorite: typeof body.favorite === 'boolean' ? body.favorite : false,
        // Only overwrite photo/source when the caller actually sent them,
        // so partial updates (e.g. favourite toggle) never wipe them.
        ...(typeof body.image === 'string' ? { image: body.image } : {}),
        ...(typeof body.sourceUrl === 'string' ? { sourceUrl: body.sourceUrl } : {}),
        ingredients: JSON.stringify(body.ingredients),
        steps: JSON.stringify(body.steps)
      }
    });

    return NextResponse.json(formatRecipe(recipe));
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to update recipe' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: any) {
  const { params } = context;

  try {
    await prisma.recipe.delete({ where: { id: params.id } });
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to delete recipe' }, { status: 500 });
  }
}
