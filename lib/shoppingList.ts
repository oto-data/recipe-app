/** localStorage-backed shopping list selection (recipe ids). */

export const SHOPPING_IDS_KEY = 'shopping-recipe-ids';
export const SHOPPING_CHECKED_KEY = 'shopping-checked-items';
export const SHOPPING_CHANGED_EVENT = 'shopping-list-changed';

export function getShoppingRecipeIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(SHOPPING_IDS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

export function setShoppingRecipeIds(ids: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(SHOPPING_IDS_KEY, JSON.stringify(ids));
  } catch {
    // storage unavailable: ignore
  }
  window.dispatchEvent(new Event(SHOPPING_CHANGED_EVENT));
}

export function toggleShoppingRecipeId(id: string): boolean {
  const current = getShoppingRecipeIds();
  const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
  setShoppingRecipeIds(next);
  return next.includes(id);
}

export function getCheckedItems(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(SHOPPING_CHECKED_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

export function setCheckedItems(items: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(SHOPPING_CHECKED_KEY, JSON.stringify(items));
  } catch {
    // storage unavailable: ignore
  }
}
