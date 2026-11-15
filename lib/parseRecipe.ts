import type { RecipeStep} from '@/lib/recipes';

export type ParsedRecipe = {
ingredients: string[];
steps: RecipeStep[];
};

const QUANTITY_PATTERN =
/(\d+(?:[./]\d+)?\s*(g|グラム|kg|ml|mL|cc|L|個|枚|本|片|株|玉|缶|袋|パック|房|切れ|かけ|束|粒|滴|杯|合))|大さじ|小さじ|少々|適量|カップ|ひとつまみ|ふたつまみ/;

const CIRCLED_NUMBERS = '①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳';

function isIngredientHeading(line: string): boolean {
const cleaned = line.replace(/[\[\]◆■●○・:：\s]/g, '');
return cleaned.startsWith('材料') && cleaned.length <= 12;
}

function isStepHeading(line: string): boolean {
const cleaned = line.replace(/[\[\]◆■●○・:：\s]/g, '');
return /^(作り方|手順|つくり方|調理手順|作りかた)/.test(cleaned) && cleaned.length <= 12;
}

/** Split "材料：鶏肉 200g" style heading lines into heading + trailing content. */
function splitHeadingContent(line: string): string {
const match = line.match(/[:：]\s*(.+)$/);
return match? match[1].trim(): '';
}

function stripBullet(line: string): string {
return line.replace(/^[\s　]*[・\-*•●○◇◆■]\s*/, '').trim();
}

function stripStepPrefix(line: string): string {
let result = stripBullet(line);
// Circled numbers ①〜⑳
if (result.length > 0 && CIRCLED_NUMBERS.includes(result[0])) {
result = result.slice(1).trim();
}
// "1." / "1、" / "(1)" / "（1）" / "1)"
result = result.replace(/^[（(]?\d+[）)．.、:：]\s*/, '');
result = result.replace(/^[（(]\d+[）)]\s*/, '');
return result.trim();
}

/**
* Rule-based paste parser (design doc 2.3).
* - Detects 材料 / 作り方 section headings.
* - Without headings, lines containing a quantity are treated as ingredients.
* - Steps keep the RecipeStep shape with an empty label for compatibility.
*/
export function parseRecipeText(text: string): ParsedRecipe {
const lines = text
.split(/\r?\n/)
.map((line) => line.trim())
.filter((line) => line.length > 0);

if (lines.length === 0) {
return { ingredients: [], steps: []};
}

const hasHeadings = lines.some((line) => isIngredientHeading(line) || isStepHeading(line));

const ingredients: string[] = [];
const steps: RecipeStep[] = [];

if (!hasHeadings) {
for (const line of lines) {
const cleaned = stripBullet(line);
if (QUANTITY_PATTERN.test(cleaned)) {
ingredients.push(cleaned);
} else {
const stepText = stripStepPrefix(line);
if (stepText) steps.push({ label: '', description: stepText});
}
}
return { ingredients, steps};
}

let section: 'pre' | 'ingredients' | 'steps' = 'pre';
const preLines: string[] = [];

for (const line of lines) {
if (isIngredientHeading(line)) {
section = 'ingredients';
const rest = splitHeadingContent(line);
if (rest) ingredients.push(stripBullet(rest));
continue;
}
if (isStepHeading(line)) {
section = 'steps';
const rest = splitHeadingContent(line);
if (rest) {
const stepText = stripStepPrefix(rest);
if (stepText) steps.push({ label: '', description: stepText});
}
continue;
}

if (section === 'ingredients') {
ingredients.push(stripBullet(line));
} else if (section === 'steps') {
const stepText = stripStepPrefix(line);
if (stepText) steps.push({ label: '', description: stepText});
} else {
preLines.push(line);
}
}

// Lines before the first heading: classify by the quantity heuristic
// (a likely title line without a quantity is ignored).
for (const line of preLines) {
const cleaned = stripBullet(line);
if (QUANTITY_PATTERN.test(cleaned)) {
ingredients.push(cleaned);
}
}

return { ingredients, steps};
}
