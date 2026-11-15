/**
 * Conservative display-only scaling of ingredient quantities.
 *
 * Only numbers directly attached to a whitelisted cooking unit are scaled
 * (e.g. 「鶏肉 200g」, 「醤油 大さじ1/2」). Numbers with other units or no
 * unit — temperatures (180℃), times (5分), sizes (3cm) — are left alone.
 * The stored recipe text is never modified.
 */

/** Units that may appear AFTER the quantity: 「200g」「2個」 */
const UNITS_AFTER = [
  '大さじ', '小さじ', 'カップ', 'パック',
  'kg', 'ml', 'mL', 'cc',
  '個', '本', '枚', '玉', '片', '束', '缶', '袋', '尾', '切れ', '房', '株',
  'g', 'L', 'l'
];

/** Units that may appear BEFORE the quantity: 「大さじ2」 */
const UNITS_BEFORE = ['大さじ', '小さじ', 'カップ'];

const UNICODE_FRACTIONS: Record<string, number> = {
  '½': 1 / 2, '¼': 1 / 4, '¾': 3 / 4,
  '⅓': 1 / 3, '⅔': 2 / 3,
  '⅛': 1 / 8, '⅜': 3 / 8, '⅝': 5 / 8, '⅞': 7 / 8
};

function normalizeDigits(text: string): string {
  return text
    .replace(/[０-９]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
    .replace(/．/g, '.')
    .replace(/／/g, '/');
}

/** Parse a quantity token: 「2」「1.5」「1/2」「1 1/2」「1と1/2」「½」「1½」 */
export function parseQuantity(raw: string): number | null {
  const text = normalizeDigits(raw).trim();
  if (!text) return null;

  const unicodeOnly = UNICODE_FRACTIONS[text];
  if (unicodeOnly !== undefined) return unicodeOnly;

  const mixedUnicode = text.match(/^(\d+(?:\.\d+)?)\s*([½¼¾⅓⅔⅛⅜⅝⅞])$/);
  if (mixedUnicode) {
    return parseFloat(mixedUnicode[1]) + UNICODE_FRACTIONS[mixedUnicode[2]];
  }

  const mixed = text.match(/^(\d+(?:\.\d+)?)\s*(?:\s|と)\s*(\d+)\s*\/\s*(\d+)$/);
  if (mixed) {
    const denominator = parseFloat(mixed[3]);
    if (denominator === 0) return null;
    return parseFloat(mixed[1]) + parseFloat(mixed[2]) / denominator;
  }

  const fraction = text.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (fraction) {
    const denominator = parseFloat(fraction[2]);
    if (denominator === 0) return null;
    return parseFloat(fraction[1]) / denominator;
  }

  const decimal = text.match(/^\d+(?:\.\d+)?$/);
  if (decimal) return parseFloat(text);

  return null;
}

const FRACTION_DENOMINATORS = [2, 3, 4, 6, 8];

/** Format a scaled quantity: integers stay integers, clean fractions become 分数. */
export function formatQuantity(value: number, unit: string): string {
  if (!Number.isFinite(value)) return String(value);
  const rounded = Math.round(value);
  if (Math.abs(value - rounded) < 0.01) return String(rounded);

  // Larger weights/volumes are friendlier rounded to whole numbers.
  if (['g', 'kg', 'ml', 'mL', 'cc', 'L', 'l'].includes(unit) && value >= 10) {
    return String(Math.round(value));
  }

  for (const denominator of FRACTION_DENOMINATORS) {
    const numerator = value * denominator;
    if (Math.abs(numerator - Math.round(numerator)) < 0.01) {
      const whole = Math.floor(value);
      const rest = Math.round(numerator) - whole * denominator;
      if (rest === 0) return String(whole);
      if (whole === 0) return `${rest}/${denominator}`;
      return `${whole}と${rest}/${denominator}`;
    }
  }

  const oneDecimal = Math.round(value * 10) / 10;
  return String(oneDecimal);
}

const QUANTITY_PATTERN = String.raw`(?:\d+(?:\.\d+)?\s*(?:\s|と)\s*\d+\s*\/\s*\d+|\d+\s*\/\s*\d+|\d+(?:\.\d+)?\s*[½¼¾⅓⅔⅛⅜⅝⅞]|[½¼¾⅓⅔⅛⅜⅝⅞]|[０-９]+(?:．[０-９]+)?(?:\s*\/\s*[０-９]+)?|\d+(?:\.\d+)?)`;
const UNITS_AFTER_PATTERN = UNITS_AFTER.slice().sort((a, b) => b.length - a.length).join('|');
const UNITS_BEFORE_PATTERN = UNITS_BEFORE.join('|');

const SCALE_PATTERN = new RegExp(
  `(${UNITS_BEFORE_PATTERN})\\s*(${QUANTITY_PATTERN})` +
  `|(${QUANTITY_PATTERN})\\s*(〜|~|～)\\s*(${QUANTITY_PATTERN})\\s*(${UNITS_AFTER_PATTERN})` +
  `|(${QUANTITY_PATTERN})\\s*(${UNITS_AFTER_PATTERN})`,
  'g'
);

export function scaleIngredientText(text: string, factor: number): string {
  if (!text || factor === 1) return text;
  return text.replace(SCALE_PATTERN, (match, unitBefore, qtyBefore, qtyFrom, rangeSep, qtyTo, rangeUnit, qty, unit) => {
    if (unitBefore) {
      const value = parseQuantity(qtyBefore);
      if (value === null) return match;
      return `${unitBefore}${formatQuantity(value * factor, unitBefore)}`;
    }
    if (rangeUnit) {
      const from = parseQuantity(qtyFrom);
      const to = parseQuantity(qtyTo);
      if (from === null || to === null) return match;
      return `${formatQuantity(from * factor, rangeUnit)}${rangeSep}${formatQuantity(to * factor, rangeUnit)}${rangeUnit}`;
    }
    const value = parseQuantity(qty);
    if (value === null) return match;
    return `${formatQuantity(value * factor, unit)}${unit}`;
  });
}

export function scaleIngredients(ingredients: string[], factor: number): string[] {
  return ingredients.map((item) => scaleIngredientText(item, factor));
}

/** Base servings from free text like 「2人前」「4人前〜」; defaults to 2. */
export function parseBaseServings(servings: string): number {
  const normalized = normalizeDigits(servings ?? '');
  const match = normalized.match(/(\d+(?:\.\d+)?(?:\s*\/\s*\d+)?)/);
  if (match) {
    const value = parseQuantity(match[1]);
    if (value !== null && value > 0) return value;
  }
  return 2;
}
