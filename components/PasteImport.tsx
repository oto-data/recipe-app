'use client';

import { useState } from 'react';
import { ClipboardPaste, Wand2 } from 'lucide-react';
import { parseRecipeText } from '@/lib/parseRecipe';
import type { RecipeStep } from '@/lib/recipes';

type PasteImportProps = {
  onApply: (ingredients: string[], steps: RecipeStep[]) => void;
};

/**
 * Paste a whole recipe text, preview the auto-split result
 * (editable, one item per line), then apply it into the form.
 */
export function PasteImport({ onApply }: PasteImportProps) {
  const [text, setText] = useState('');
  const [previewIngredients, setPreviewIngredients] = useState<string | null>(null);
  const [previewSteps, setPreviewSteps] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleParse = () => {
    const parsed = parseRecipeText(text);
    if (parsed.ingredients.length === 0 && parsed.steps.length === 0) {
      setPreviewIngredients(null);
      setPreviewSteps(null);
      setMessage('分けられる材料・手順が見つかりませんでした。文章を確認してください。');
      return;
    }
    setPreviewIngredients(parsed.ingredients.join('\n'));
    setPreviewSteps(parsed.steps.map((step) => step.description).join('\n'));
    setMessage(`材料 ${parsed.ingredients.length} 件・手順 ${parsed.steps.length} 件に分けました。違ったら下で直してね。`);
  };

  const handleApply = () => {
    const ingredients = (previewIngredients ?? '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    const steps: RecipeStep[] = (previewSteps ?? '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((description) => ({ label: '', description }));
    onApply(ingredients, steps);
    setMessage('フォームに反映しました。');
  };

  return (
    <div className="space-y-4 rounded-3xl border border-border bg-background p-5">
      <div className="flex items-center gap-2">
        <ClipboardPaste className="h-5 w-5 text-accent" />
        <p className="text-sm font-semibold text-textPrimary">まるごと貼り付け</p>
      </div>
      <p className="text-sm leading-6 text-textSecondary">
        レシピサイトやメモの文章をそのまま貼ると、材料と手順に自動で分けます。
      </p>
      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder={'例：\n材料\n鶏むね肉 200g\n醤油 大さじ2\n作り方\n1. 鶏肉を切る\n2. 焼いて調味料を絡める'}
        className="min-h-[140px] w-full rounded-3xl border border-border bg-white p-4 text-base text-textPrimary outline-none focus:border-accent"
      />
      <button
        type="button"
        onClick={handleParse}
        disabled={!text.trim()}
        className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accentDark disabled:opacity-40"
      >
        <Wand2 className="h-4 w-4" />
        材料と手順に分ける
      </button>

      {message ? <p className="text-sm text-textSecondary">{message}</p> : null}

      {previewIngredients !== null && previewSteps !== null ? (
        <div className="space-y-4 rounded-3xl border border-border bg-white p-4">
          <div className="space-y-2">
            <span className="text-sm font-medium text-textSecondary">材料（1行に1つ）</span>
            <textarea
              value={previewIngredients}
              onChange={(event) => setPreviewIngredients(event.target.value)}
              className="min-h-[100px] w-full rounded-2xl border border-border bg-background p-3 text-sm text-textPrimary outline-none focus:border-accent"
            />
          </div>
          <div className="space-y-2">
            <span className="text-sm font-medium text-textSecondary">手順（1行に1ステップ）</span>
            <textarea
              value={previewSteps}
              onChange={(event) => setPreviewSteps(event.target.value)}
              className="min-h-[100px] w-full rounded-2xl border border-border bg-background p-3 text-sm text-textPrimary outline-none focus:border-accent"
            />
          </div>
          <button
            type="button"
            onClick={handleApply}
            className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accentDark"
          >
            この内容をフォームに反映
          </button>
        </div>
      ) : null}
    </div>
  );
}
