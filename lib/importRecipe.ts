import type { RecipeStep } from './recipes';

/**
 * Pure extraction of a recipe draft from a fetched HTML page.
 * Looks for schema.org Recipe JSON-LD; falls back to og:title / <title>.
 * No network or DOM APIs are used, so this is unit-testable in plain node.
 */

export type ImportedRecipeDraft = {
  title: string;
  description: string;
  ingredients: string[];
  steps: RecipeStep[];
  /** Remote http(s) image URL, stored as-is (never downloaded). '' when none. */
  image: string;
  /** Human readable duration text like 「1時間30分」. '' when unknown. */
  duration: string;
  servings: string;
  sourceUrl: string;
  /** True when no full Recipe JSON-LD was found (title + URL only, or gaps). */
  partial: boolean;
};

const HTML_ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&nbsp;': ' '
};

export function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&[a-zA-Z#0-9]+;/g, (entity) => HTML_ENTITIES[entity] ?? entity);
}

function cleanText(value: unknown): string {
  if (typeof value !== 'string') return '';
  const withoutTags = value.replace(/<[^>]*>/g, ' ');
  return decodeHtmlEntities(withoutTags).replace(/\s+/g, ' ').trim();
}

function isRecipeType(node: any): boolean {
  const type = node?.['@type'];
  if (typeof type === 'string') return type.toLowerCase() === 'recipe';
  if (Array.isArray(type)) return type.some((t) => typeof t === 'string' && t.toLowerCase() === 'recipe');
  return false;
}

/** Recursively collect every object whose @type is Recipe. */
function collectRecipes(node: unknown, out: any[]): void {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    for (const item of node) collectRecipes(item, out);
    return;
  }
  const record = node as Record<string, unknown>;
  if (isRecipeType(record)) {
    out.push(record);
    return;
  }
  if (Array.isArray(record['@graph'])) {
    for (const item of record['@graph']) collectRecipes(item, out);
  }
}

export function findRecipeJsonLd(html: string): any | null {
  const scriptPattern = /<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;
  while ((match = scriptPattern.exec(html)) !== null) {
    const raw = match[1].trim();
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw);
      const found: any[] = [];
      collectRecipes(parsed, found);
      if (found.length > 0) return found[0];
    } catch {
      // Some sites wrap JSON in comments or have trailing commas; skip broken blocks.
      continue;
    }
  }
  return null;
}

function flattenInstructions(node: unknown, out: string[]): void {
  if (typeof node === 'string') {
    for (const line of node.split(/\r?\n/)) {
      const text = cleanText(line);
      if (text) out.push(text);
    }
    return;
  }
  if (Array.isArray(node)) {
    for (const item of node) flattenInstructions(item, out);
    return;
  }
  if (node && typeof node === 'object') {
    const record = node as Record<string, unknown>;
    // HowToSection: recurse into its itemListElement steps.
    if (Array.isArray(record.itemListElement)) {
      for (const item of record.itemListElement) flattenInstructions(item, out);
      return;
    }
    // HowToStep (or anything with a text field).
    const text = cleanText(record.text);
    if (text) {
      out.push(text);
      return;
    }
    const name = cleanText(record.name);
    if (name) out.push(name);
  }
}

function extractImage(image: unknown): string {
  if (typeof image === 'string') {
    return /^https?:\/\//i.test(image.trim()) ? image.trim() : '';
  }
  if (Array.isArray(image)) {
    for (const item of image) {
      const found = extractImage(item);
      if (found) return found;
    }
    return '';
  }
  if (image && typeof image === 'object') {
    return extractImage((image as Record<string, unknown>).url);
  }
  return '';
}

/** Parse an ISO 8601 duration (PT1H30M etc.) into total minutes, or null. */
export function parseIsoDurationMinutes(value: unknown): number | null {
  if (typeof value !== 'string') return null;
  const match = value.trim().match(/^P(?:(\d+(?:\.\d+)?)D)?(?:T(?:(\d+(?:\.\d+)?)H)?(?:(\d+(?:\.\d+)?)M)?(?:(\d+(?:\.\d+)?)S)?)?$/i);
  if (!match) return null;
  const days = parseFloat(match[1] ?? '0');
  const hours = parseFloat(match[2] ?? '0');
  const minutes = parseFloat(match[3] ?? '0');
  const seconds = parseFloat(match[4] ?? '0');
  const total = days * 24 * 60 + hours * 60 + minutes + seconds / 60;
  return total > 0 ? total : null;
}

export function formatDurationMinutes(totalMinutes: number): string {
  const rounded = Math.round(totalMinutes);
  if (rounded <= 0) return '';
  const hours = Math.floor(rounded / 60);
  const minutes = rounded % 60;
  if (hours > 0 && minutes > 0) return `${hours}時間${minutes}分`;
  if (hours > 0) return `${hours}時間`;
  return `${minutes}分`;
}

function extractDuration(recipe: Record<string, unknown>): string {
  const total = parseIsoDurationMinutes(recipe.totalTime);
  if (total !== null) return formatDurationMinutes(total);
  const prep = parseIsoDurationMinutes(recipe.prepTime);
  const cook = parseIsoDurationMinutes(recipe.cookTime);
  if (prep !== null && cook !== null) return formatDurationMinutes(prep + cook);
  if (prep !== null) return formatDurationMinutes(prep);
  if (cook !== null) return formatDurationMinutes(cook);
  return '';
}

function extractServings(recipeYield: unknown): string {
  const first = Array.isArray(recipeYield) ? recipeYield[0] : recipeYield;
  if (typeof first === 'number' && first > 0) return `${first}人前`;
  const text = cleanText(first);
  if (!text) return '';
  if (/^\d+(?:\.\d+)?$/.test(text)) return `${text}人前`;
  return text;
}

function extractPageTitle(html: string): string {
  const ogMatch = html.match(/<meta[^>]+property\s*=\s*["']og:title["'][^>]*content\s*=\s*["']([^"']*)["']/i)
    ?? html.match(/<meta[^>]+content\s*=\s*["']([^"']*)["'][^>]*property\s*=\s*["']og:title["']/i);
  if (ogMatch) {
    const title = cleanText(ogMatch[1]);
    if (title) return title;
  }
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch) return cleanText(titleMatch[1]);
  return '';
}

export function extractRecipeFromHtml(html: string, sourceUrl: string): ImportedRecipeDraft {
  const recipe = findRecipeJsonLd(html);

  if (!recipe) {
    return {
      title: extractPageTitle(html),
      description: '',
      ingredients: [],
      steps: [],
      image: '',
      duration: '',
      servings: '',
      sourceUrl,
      partial: true
    };
  }

  const ingredients = Array.isArray(recipe.recipeIngredient)
    ? recipe.recipeIngredient.map((item: unknown) => cleanText(item)).filter(Boolean)
    : [];

  const stepTexts: string[] = [];
  flattenInstructions(recipe.recipeInstructions, stepTexts);
  const steps: RecipeStep[] = stepTexts.map((description) => ({ label: '', description }));

  return {
    title: cleanText(recipe.name),
    description: cleanText(recipe.description),
    ingredients,
    steps,
    image: extractImage(recipe.image),
    duration: extractDuration(recipe),
    servings: extractServings(recipe.recipeYield),
    sourceUrl,
    partial: ingredients.length === 0 && steps.length === 0
  };
}
