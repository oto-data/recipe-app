'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, ChevronDown, Sparkles, X } from 'lucide-react';
import { categories, durationOptions, getCategoryMeta, servingsOptions, tags } from '@/lib/recipes';
import type { RecipeFormValues, RecipeStep } from '@/lib/recipes';
import { ChipSelect, TagChips } from '@/components/ChipSelect';
import { PasteImport } from '@/components/PasteImport';
import { UrlImport } from '@/components/UrlImport';
import type { ImportedRecipeDraft } from '@/lib/importRecipe';

export type { RecipeFormValues } from '@/lib/recipes';

type RecipeFormProps = {
  initialValues?: RecipeFormValues;
  /** Used for the draft autosave key (recipe-draft-edit-<id>). Omit for new recipes. */
  recipeId?: string;
  submitLabel: string;
  onSubmit: (values: RecipeFormValues) => Promise<void>;
};

type Draft = {
  title: string;
  description: string;
  category: string;
  duration: string;
  servings: string;
  ingredients: string[];
  steps: RecipeStep[];
  notes: string;
  tags: string[];
  image: string;
  sourceUrl: string;
};

function flattenSteps(steps: RecipeStep[]): RecipeStep[] {
  return steps.map((step) => {
    const label = step.label?.trim() ?? '';
    const description = step.description?.trim() ?? '';
    if (label && description && !description.includes(label)) {
      return { label: '', description: `${label} ${description}` };
    }
    return { label: '', description: description || label };
  });
}

export function RecipeForm({ initialValues, recipeId, submitLabel, onSubmit }: RecipeFormProps) {
  const draftKey = recipeId ? `recipe-draft-edit-${recipeId}` : 'recipe-draft-new';
  const draftReady = useRef(false);

  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [category, setCategory] = useState(initialValues?.category ?? '');
  const [duration, setDuration] = useState(initialValues?.duration ?? '');
  const [servings, setServings] = useState(initialValues?.servings ?? '');
  const [ingredients, setIngredients] = useState<string[]>(
    initialValues?.ingredients.length ? initialValues.ingredients : ['']
  );
  const [steps, setSteps] = useState<RecipeStep[]>(
    initialValues?.steps.length ? flattenSteps(initialValues.steps) : [{ label: '', description: '' }]
  );
  const [notes, setNotes] = useState(initialValues?.notes ?? '');
  const [image, setImage] = useState(initialValues?.image ?? '');
  const [sourceUrl, setSourceUrl] = useState(initialValues?.sourceUrl ?? '');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(initialValues?.tags ?? []);
  const [showDetails, setShowDetails] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Restore a saved draft once, on mount.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(draftKey);
      if (raw) {
        const draft = JSON.parse(raw) as Draft;
        setTitle(draft.title ?? '');
        setDescription(draft.description ?? '');
        setCategory(draft.category ?? '');
        setDuration(draft.duration ?? '');
        setServings(draft.servings ?? '');
        setIngredients(draft.ingredients?.length ? draft.ingredients : ['']);
        setSteps(draft.steps?.length ? flattenSteps(draft.steps) : [{ label: '', description: '' }]);
        setNotes(draft.notes ?? '');
        setImage(draft.image ?? '');
        setSourceUrl(draft.sourceUrl ?? '');
        setSelectedTags(draft.tags ?? []);
        if (draft.description || draft.notes || draft.sourceUrl) setShowDetails(true);
      }
    } catch {
      // ignore broken drafts
    }
    draftReady.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Autosave the draft whenever the form changes (after restore).
  useEffect(() => {
    if (!draftReady.current) return;
    const draft: Draft = {
      title,
      description,
      category,
      duration,
      servings,
      ingredients,
      steps,
      notes,
      tags: selectedTags,
      image,
      sourceUrl
    };
    try {
      window.localStorage.setItem(draftKey, JSON.stringify(draft));
    } catch {
      // storage full / unavailable: ignore
    }
  }, [draftKey, title, description, category, duration, servings, ingredients, steps, notes, selectedTags, image, sourceUrl]);

  const handleAddIngredient = () => setIngredients((current) => [...current, '']);
  const handleRemoveIngredient = (index: number) =>
    setIngredients((current) => current.filter((_, idx) => idx !== index));
  const handleIngredientChange = (index: number, value: string) =>
    setIngredients((current) => current.map((item, idx) => (idx === index ? value : item)));

  const handleAddStep = () => setSteps((current) => [...current, { label: '', description: '' }]);
  const handleRemoveStep = (index: number) =>
    setSteps((current) => current.filter((_, idx) => idx !== index));
  const handleStepChange = (index: number, value: string) =>
    setSteps((current) =>
      current.map((step, idx) => (idx === index ? { label: '', description: value } : step))
    );

  const toggleTag = (tag: string) => {
    setSelectedTags((current) =>
      current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]
    );
  };
  const addCustomTag = (tag: string) => {
    setSelectedTags((current) => (current.includes(tag) ? current : [...current, tag]));
  };

  const handlePasteApply = (newIngredients: string[], newSteps: RecipeStep[]) => {
    if (newIngredients.length > 0) setIngredients(newIngredients);
    if (newSteps.length > 0) setSteps(newSteps);
  };

  const handleUrlApply = (draft: ImportedRecipeDraft) => {
    if (draft.title) setTitle(draft.title);
    if (draft.description) setDescription(draft.description);
    if (draft.duration) setDuration(draft.duration);
    if (draft.servings) setServings(draft.servings);
    if (draft.ingredients.length > 0) setIngredients(draft.ingredients);
    if (draft.steps.length > 0) setSteps(draft.steps);
    if (draft.image) {
      handlePhotoChange(null);
      setImage(draft.image);
    }
    if (draft.sourceUrl) setSourceUrl(draft.sourceUrl);
    if (draft.description || draft.sourceUrl) setShowDetails(true);
  };

  const handlePhotoChange = (file: File | null) => {
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoFile(file);
    setPhotoPreview(file ? URL.createObjectURL(file) : '');
  };

  const handlePhotoRemove = () => {
    handlePhotoChange(null);
    setImage('');
  };

  const uploadPhoto = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch('/api/upload', { method: 'POST', body: formData });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.url) {
      throw new Error(payload?.error ?? '写真のアップロードに失敗しました。');
    }
    return payload.url as string;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError('料理名を入力してください。（必須は料理名だけです）');
      return;
    }

    setIsSaving(true);
    try {
      // A newly chosen photo is uploaded first; the returned local path is saved on the recipe.
      const imageUrl = photoFile ? await uploadPhoto(photoFile) : image;
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        category,
        duration: duration.trim(),
        servings: servings.trim(),
        notes: notes.trim(),
        image: imageUrl,
        sourceUrl: sourceUrl.trim(),
        tags: selectedTags,
        ingredients: ingredients.map((item) => item.trim()).filter(Boolean),
        steps: steps
          .map((step) => ({ label: '', description: step.description.trim() }))
          .filter((step) => step.description),
        favorite: initialValues?.favorite ?? false
      });
      try {
        window.localStorage.removeItem(draftKey);
      } catch {
        // ignore
      }
    } catch (error: any) {
      setFormError(error?.message ?? '保存中にエラーが発生しました。');
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass =
    'w-full rounded-3xl border border-border bg-background px-4 py-3 text-base text-textPrimary outline-none transition focus:border-accent';

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <label className="block space-y-2">
        <span className="text-sm font-medium text-textSecondary">料理名（必須はこれだけ）</span>
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="例：鶏むね肉の照り焼き"
          className={inputClass}
        />
      </label>

      <div className="space-y-2">
        <span className="text-sm font-medium text-textSecondary">写真（任意）</span>
        {photoPreview || image ? (
          <div className="relative overflow-hidden rounded-3xl border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoPreview || image}
              alt="レシピの写真"
              className="h-48 w-full object-cover"
            />
            <div className="absolute right-3 top-3 flex gap-2">
              <label className="cursor-pointer rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-textPrimary shadow-sm transition hover:text-accent">
                変更
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(event) => {
                    handlePhotoChange(event.target.files?.[0] ?? null);
                    event.target.value = '';
                  }}
                />
              </label>
              <button
                type="button"
                onClick={handlePhotoRemove}
                className="inline-flex items-center gap-1 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-red-600 shadow-sm transition hover:bg-white"
              >
                <X className="h-4 w-4" />
                削除
              </button>
            </div>
          </div>
        ) : (
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-border bg-background px-4 py-8 text-textSecondary transition hover:border-accent hover:text-accent">
            <Camera className="h-8 w-8" />
            <span className="text-sm font-semibold">タップで写真を撮る・選ぶ</span>
            <span className="text-xs">写真と料理名だけでも保存できます</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(event) => {
                handlePhotoChange(event.target.files?.[0] ?? null);
                event.target.value = '';
              }}
            />
          </label>
        )}
      </div>

      <UrlImport onApply={handleUrlApply} />

      <PasteImport onApply={handlePasteApply} />

      <div className="grid gap-5 rounded-3xl border border-border bg-background p-5 sm:grid-cols-2">
        <ChipSelect
          label="調理時間"
          options={durationOptions.map((value) => ({ value, label: value }))}
          value={duration}
          onChange={setDuration}
        />
        <ChipSelect
          label="人数"
          options={servingsOptions.map((value) => ({ value, label: value }))}
          value={servings}
          onChange={setServings}
        />
        <div className="sm:col-span-2">
          <ChipSelect
            label="カテゴリー"
            options={categories.map((value) => ({
              value,
              label: `${getCategoryMeta(value).emoji} ${value}`
            }))}
            value={category}
            onChange={setCategory}
          />
        </div>
      </div>

      <div className="space-y-4 rounded-3xl border border-border bg-background p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-textSecondary">材料</p>
          <button
            type="button"
            onClick={handleAddIngredient}
            className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accentDark"
          >
            + 追加
          </button>
        </div>
        <div className="space-y-3">
          {ingredients.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <input
                type="text"
                value={item}
                onChange={(event) => handleIngredientChange(index, event.target.value)}
                placeholder="例：鶏むね肉 200g"
                className={inputClass}
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
          <p className="text-sm font-medium text-textSecondary">作り方の手順</p>
          <button
            type="button"
            onClick={handleAddStep}
            className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accentDark"
          >
            + 追加
          </button>
        </div>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={index} className="rounded-3xl border border-border bg-white p-4">
              <div className="mb-3 flex items-center justify-between gap-4">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent text-base font-bold text-white">
                  {index + 1}
                </span>
                {steps.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveStep(index)}
                    className="text-sm font-medium text-accent"
                  >
                    削除
                  </button>
                )}
              </div>
              <textarea
                value={step.description}
                onChange={(event) => handleStepChange(index, event.target.value)}
                placeholder="例：玉ねぎを薄切りにして、フライパンで炒める。"
                className="min-h-[80px] w-full rounded-3xl border border-border bg-background p-4 text-base text-textPrimary outline-none transition focus:border-accent"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-background p-5">
        <TagChips
          label="タグ"
          presetTags={tags}
          selectedTags={selectedTags}
          onToggle={toggleTag}
          onAddCustom={addCustomTag}
        />
      </div>

      <div className="rounded-3xl border border-border bg-background p-5">
        <button
          type="button"
          onClick={() => setShowDetails((current) => !current)}
          className="flex w-full items-center justify-between text-sm font-semibold text-textPrimary"
        >
          <span className="inline-flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            くわしく書く（説明・メモ・出典）
          </span>
          <ChevronDown
            className={`h-5 w-5 text-textSecondary transition ${showDetails ? 'rotate-180' : ''}`}
          />
        </button>
        {showDetails ? (
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-textSecondary">料理説明</span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="例：しっとり仕上げる和風の照り焼き。"
                className="min-h-[96px] w-full rounded-3xl border border-border bg-white p-4 text-base text-textPrimary outline-none transition focus:border-accent"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-textSecondary">メモ・コツ</span>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="例：たれは弱火で焦がさないように。"
                className="min-h-[96px] w-full rounded-3xl border border-border bg-white p-4 text-base text-textPrimary outline-none transition focus:border-accent"
              />
            </label>
            <label className="block space-y-2 sm:col-span-2">
              <span className="text-sm font-medium text-textSecondary">出典URL</span>
              <input
                type="url"
                value={sourceUrl}
                onChange={(event) => setSourceUrl(event.target.value)}
                placeholder="例：https://cookpad.com/recipe/…"
                className="w-full rounded-3xl border border-border bg-white px-4 py-3 text-base text-textPrimary outline-none transition focus:border-accent"
              />
            </label>
          </div>
        ) : null}
      </div>

      {formError ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {formError}
        </div>
      ) : null}

      <div className="sticky bottom-4 z-10">
        <button
          type="submit"
          disabled={isSaving}
          className="w-full rounded-full bg-accent px-5 py-4 text-base font-semibold text-white shadow-soft transition hover:bg-accentDark disabled:opacity-50"
        >
          {isSaving ? '保存中…' : submitLabel}
        </button>
      </div>
    </form>
  );
}
