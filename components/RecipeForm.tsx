'use client';

import { useMemo, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { categories, tags } from '@/lib/recipes';
import type { RecipeFormValues } from '@/lib/recipes';
export type { RecipeFormValues } from '@/lib/recipes';

const initialStep = { label: '', description: '' };

type RecipeFormProps = {
  initialValues?: RecipeFormValues;
  submitLabel: string;
  onSubmit: (values: RecipeFormValues) => Promise<void>;
};

export function RecipeForm({ initialValues, submitLabel, onSubmit }: RecipeFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [category, setCategory] = useState(initialValues?.category ?? '');
  const [duration, setDuration] = useState(initialValues?.duration ?? '');
  const [servings, setServings] = useState(initialValues?.servings ?? '2人前');
  const [ingredients, setIngredients] = useState<string[]>(initialValues?.ingredients.length ? initialValues.ingredients : ['']);
  const [steps, setSteps] = useState(initialValues?.steps.length ? initialValues.steps : [initialStep, initialStep]);
  const [notes, setNotes] = useState(initialValues?.notes ?? '');
  const [selectedTags, setSelectedTags] = useState<string[]>(initialValues?.tags ?? []);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const ingredientCount = ingredients.filter(Boolean).length;
  const stepCount = steps.filter((step) => step.label || step.description).length;

  const selectedTagLabel = useMemo(
    () => (selectedTags.length > 0 ? selectedTags.join(' / ') : 'タグを選択してください。'),
    [selectedTags]
  );

  const handleAddIngredient = () => setIngredients((current) => [...current, '']);
  const handleRemoveIngredient = (index: number) =>
    setIngredients((current) => current.filter((_, idx) => idx !== index));
  const handleIngredientChange = (index: number, value: string) =>
    setIngredients((current) => current.map((item, idx) => (idx === index ? value : item)));

  const handleAddStep = () => setSteps((current) => [...current, { ...initialStep }]);
  const handleRemoveStep = (index: number) =>
    setSteps((current) => current.filter((_, idx) => idx !== index));
  const handleStepChange = (index: number, key: 'label' | 'description', value: string) =>
    setSteps((current) => current.map((step, idx) => (idx === index ? { ...step, [key]: value } : step)));

  const toggleTag = (tag: string) => {
    setSelectedTags((current) =>
      current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (!title.trim() || !description.trim()) {
      setFormError('料理名と説明は必須です。');
      return;
    }

    if (ingredients.filter(Boolean).length === 0) {
      setFormError('材料を少なくとも1つ入力してください。');
      return;
    }

    if (steps.filter((step) => step.label || step.description).length === 0) {
      setFormError('手順を少なくとも1つ入力してください。');
      return;
    }

    setIsSaving(true);

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        category,
        duration: duration.trim(),
        servings: servings.trim(),
        notes: notes.trim(),
        tags: selectedTags,
        ingredients: ingredients.filter(Boolean),
        steps: steps.filter((step) => step.label || step.description),
        favorite: initialValues?.favorite ?? false
      });
    } catch (error: any) {
      setFormError(error?.message ?? '保存中にエラーが発生しました。');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-textSecondary">料理名</span>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="例：秋鮭のホイル焼き"
            className="w-full rounded-3xl border border-border bg-background px-4 py-3 text-base text-textPrimary outline-none transition focus:border-accent"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-textSecondary">調理時間</span>
          <input
            type="text"
            value={duration}
            onChange={(event) => setDuration(event.target.value)}
            placeholder="例：30分"
            className="w-full rounded-3xl border border-border bg-background px-4 py-3 text-base text-textPrimary outline-none transition focus:border-accent"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-textSecondary">サービング数</span>
          <input
            type="text"
            value={servings}
            onChange={(event) => setServings(event.target.value)}
            placeholder="2人前"
            className="w-full rounded-3xl border border-border bg-background px-4 py-3 text-base text-textPrimary outline-none transition focus:border-accent"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-textSecondary">カテゴリー</span>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="w-full rounded-3xl border border-border bg-background px-4 py-3 text-base text-textPrimary outline-none transition focus:border-accent"
          >
            <option value="">選択してください</option>
            {categories.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="space-y-2 sm:col-span-2">
          <span className="text-sm font-medium text-textSecondary">料理説明</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="例：焼き鮭を香ばしく仕上げる和風レシピ。"
            className="min-h-[96px] w-full rounded-3xl border border-border bg-background p-4 text-base text-textPrimary outline-none transition focus:border-accent"
          />
        </label>
      </div>

      <div className="space-y-4 rounded-3xl border border-border bg-background p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-textSecondary">材料</p>
            <p className="mt-1 text-sm text-textSecondary">{ingredientCount} 行</p>
          </div>
          <button type="button" onClick={handleAddIngredient} className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accentDark">
            + 追加
          </button>
        </div>
        <div className="space-y-3">
          {ingredients.map((item, index) => (
            <div key={index} className="flex flex-col gap-3 rounded-3xl border border-border bg-white p-4 sm:flex-row sm:items-center">
              <input
                type="text"
                value={item}
                onChange={(event) => handleIngredientChange(index, event.target.value)}
                placeholder="例：鶏むね肉 200g"
                className="w-full rounded-3xl border border-border bg-background px-4 py-3 text-base text-textPrimary outline-none focus:border-accent"
              />
              {ingredients.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveIngredient(index)}
                  className="shrink-0 rounded-full border border-border bg-white px-4 py-3 text-sm font-semibold text-textSecondary transition hover:border-accent hover:text-accent"
                >
                  削除
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4 rounded-3xl border border-border bg-background p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-textSecondary">作り方の手順</p>
            <p className="mt-1 text-sm text-textSecondary">{stepCount} ステップ</p>
          </div>
          <button type="button" onClick={handleAddStep} className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accentDark">
            + 追加
          </button>
        </div>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={index} className="rounded-3xl border border-border bg-white p-4">
              <div className="mb-4 flex items-center justify-between gap-4">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent text-lg font-bold text-white">{index + 1}</span>
                {steps.length > 1 && (
                  <button type="button" onClick={() => handleRemoveStep(index)} className="text-sm font-medium text-accent">
                    削除
                  </button>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-[1fr_1.6fr]">
                <input
                  type="text"
                  value={step.label}
                  onChange={(event) => handleStepChange(index, 'label', event.target.value)}
                  placeholder="例：玉ねぎを薄切りにする"
                  className="w-full rounded-3xl border border-border bg-background px-4 py-3 text-base text-textPrimary outline-none transition focus:border-accent"
                />
                <textarea
                  value={step.description}
                  onChange={(event) => handleStepChange(index, 'description', event.target.value)}
                  placeholder="例：玉ねぎを薄切りにして、オイルをひいたフライパンで炒める。"
                  className="min-h-[120px] w-full rounded-3xl border border-border bg-background p-4 text-base text-textPrimary outline-none transition focus:border-accent"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4 rounded-3xl border border-border bg-background p-5">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <span className="text-sm font-medium text-textSecondary">メモ・コツ</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="例：鶏肉は下味をしっかり染み込ませると柔らかく仕上がります。"
              className="min-h-[140px] w-full rounded-3xl border border-border bg-background p-4 text-base text-textPrimary outline-none transition focus:border-accent"
            />
          </div>
          <div className="space-y-3 rounded-3xl border border-border bg-white p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-textSecondary">
              <Sparkles className="h-4 w-4 text-accent" />
              <span>タグ</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => {
                const active = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`rounded-full border px-4 py-2 text-sm transition ${
                      active
                        ? 'border-accent bg-accent text-white'
                        : 'border-border bg-background text-textPrimary hover:border-accent hover:text-accent'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
            <p className="text-sm text-textSecondary">{selectedTagLabel}</p>
          </div>
        </div>
      </div>

      {formError ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {formError}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accentDark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? '保存中...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
