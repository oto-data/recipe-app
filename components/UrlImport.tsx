'use client';

import { useState } from 'react';
import { Globe, Loader2 } from 'lucide-react';
import type { ImportedRecipeDraft } from '@/lib/importRecipe';

type UrlImportProps = {
  onApply: (draft: ImportedRecipeDraft) => void;
};

/**
 * Paste a recipe page URL; the server extracts a draft from the page's
 * schema.org Recipe JSON-LD and applies it into the form.
 */
export function UrlImport({ onApply }: UrlImportProps) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const handleImport = async () => {
    const target = url.trim();
    if (!target) return;
    setIsLoading(true);
    setMessage(null);
    setIsError(false);
    try {
      const response = await fetch('/api/import-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: target })
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload) {
        throw new Error(payload?.error ?? '取り込みに失敗しました。');
      }
      const draft = payload as ImportedRecipeDraft;
      onApply(draft);
      setIsError(false);
      setMessage(
        draft.partial
          ? 'タイトルとURLだけ取り込みました。本文は「まるごと貼り付け」で追加できます。'
          : `取り込みました（材料 ${draft.ingredients.length} 件・手順 ${draft.steps.length} 件）。`
      );
    } catch (error: any) {
      setIsError(true);
      setMessage(error?.message ?? '取り込みに失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 rounded-3xl border border-border bg-background p-5">
      <div className="flex items-center gap-2">
        <Globe className="h-5 w-5 text-accent" />
        <p className="text-sm font-semibold text-textPrimary">URLから取り込む</p>
      </div>
      <p className="text-sm leading-6 text-textSecondary">
        レシピサイトのURLを貼ると、料理名・材料・手順を自動で取り込みます。
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="例：https://cookpad.com/recipe/…"
          className="w-full rounded-full border border-border bg-white px-4 py-3 text-base text-textPrimary outline-none focus:border-accent"
        />
        <button
          type="button"
          onClick={handleImport}
          disabled={!url.trim() || isLoading}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accentDark disabled:opacity-40"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {isLoading ? '取り込み中…' : '取り込む'}
        </button>
      </div>
      {message ? (
        <p className={`text-sm ${isError ? 'text-red-600' : 'text-textSecondary'}`}>{message}</p>
      ) : null}
    </div>
  );
}
