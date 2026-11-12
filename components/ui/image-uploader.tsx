"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ImagePlus, Loader2, Star, X } from "lucide-react";
import { uploadImage, deleteUploadedMediaAction } from "@/lib/actions/upload";
import { cn } from "@/lib/utils";

type ImageUploaderProps = {
  name: string;
  label: string;
  multiple?: boolean;
  initial?: string[];
  maxImages?: number;
  onChange?: (urls: string[]) => void;
};

export function ImageUploader({
  name,
  label,
  multiple = false,
  initial = [],
  maxImages = 24,
  onChange,
}: ImageUploaderProps) {
  const [urls, setUrls] = useState<string[]>(initial);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevUrlsRef = useRef(urls);

  useEffect(() => {
    if (prevUrlsRef.current === urls) return;
    prevUrlsRef.current = urls;
    onChange?.(urls);
  }, [urls, onChange]);

  const uploading = progress !== null;

  function removeAt(index: number) {
    const urlToRemove = urls[index];
    setUrls((prev) => prev.filter((_, i) => i !== index));
    if (urlToRemove) {
      deleteUploadedMediaAction(urlToRemove).catch((err) => {
        console.warn("[image-uploader] Failed to clean up media:", err);
      });
    }
  }

  function moveItem(from: number, to: number) {
    if (from === to || to < 0 || to >= urls.length) return;
    setUrls((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }

  function setAsCover(index: number) {
    moveItem(index, 0);
  }

  async function handleFiles(files: FileList | File[] | null) {
    if (!files || files.length === 0) return;

    const allFiles = Array.from(files);
    const remainingSlots = multiple ? Math.max(0, maxImages - urls.length) : 1;
    if (multiple && remainingSlots === 0) {
      setError(`Maximum of ${maxImages} images reached. Remove an image before adding more.`);
      return;
    }

    const queue = multiple ? allFiles.slice(0, remainingSlots) : [allFiles[0]];
    const truncated = multiple && allFiles.length > remainingSlots;

    setError(null);
    setProgress({ done: 0, total: queue.length });

    const uploaded: string[] = [];
    let uploadError: string | null = null;

    try {
      for (let i = 0; i < queue.length; i++) {
        const fd = new FormData();
        fd.append("file", queue[i]);
        const result = await uploadImage(fd);
        setProgress({ done: i + 1, total: queue.length });

        if (!result.ok) {
          uploadError = result.error;
          continue;
        }
        uploaded.push(result.url);
      }

      if (uploaded.length > 0) {
        setUrls((prev) => {
          if (!multiple) return [uploaded[0]];
          const seen = new Set(prev);
          const uniqueNew = uploaded.filter((url) => {
            if (seen.has(url)) return false;
            seen.add(url);
            return true;
          });
          return [...prev, ...uniqueNew];
        });
      }

      if (uploadError) {
        setError(uploadError);
      } else if (truncated) {
        setError(`Only the first ${remainingSlots} file(s) were uploaded (limit ${maxImages}).`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setProgress(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleDropzoneDragOver(event: React.DragEvent<HTMLLabelElement>) {
    if (!event.dataTransfer.types.includes("Files")) return;
    event.preventDefault();
    if (!uploading) setIsDraggingFiles(true);
  }

  function handleDropzoneDragLeave(event: React.DragEvent<HTMLLabelElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsDraggingFiles(false);
    }
  }

  function handleDropzoneDrop(event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDraggingFiles(false);
    if (uploading) return;
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      void handleFiles(event.dataTransfer.files);
    }
  }

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <label className="block text-sm font-medium text-forest-900">{label}</label>
        {multiple && urls.length > 0 ? (
          <span className="text-xs font-medium tabular-nums text-forest-700/60">
            {urls.length} / {maxImages} images
          </span>
        ) : null}
      </div>

      <label
        onDragOver={handleDropzoneDragOver}
        onDragLeave={handleDropzoneDragLeave}
        onDrop={handleDropzoneDrop}
        className={cn(
          "flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors",
          uploading
            ? "border-gold-400 bg-gold-100/25"
            : isDraggingFiles
              ? "border-forest-600 bg-forest-50"
              : "border-sand-300 bg-sand-50 hover:border-forest-400"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          className="sr-only"
          disabled={uploading}
          onChange={(e) => void handleFiles(e.target.files)}
        />
        {uploading ? (
          <>
            <Loader2 className="h-6 w-6 animate-spin text-forest-700" aria-hidden />
            <span className="text-sm font-medium text-forest-800">
              {progress.total > 1
                ? `Uploading ${progress.done} of ${progress.total}…`
                : "Uploading…"}
            </span>
          </>
        ) : (
          <>
            <ImagePlus className="h-6 w-6 text-forest-700" aria-hidden />
            <span className="text-sm font-medium text-forest-900">
              {multiple
                ? "Click or drag & drop gallery images"
                : "Click or drag & drop an image"}
            </span>
            <span className="text-xs text-forest-700/60">
              JPG, PNG, WebP, GIF or AVIF · up to 8 MB each
            </span>
          </>
        )}
      </label>

      {error ? (
        <p className="mt-2 text-sm text-soil-700" role="alert">
          {error}
        </p>
      ) : null}

      {urls.length > 0 ? (
        <div
          className={cn(
            "mt-3 grid gap-3",
            multiple ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" : "grid-cols-1 md:max-w-xs"
          )}
        >
          {urls.map((url, index) => {
            const isCover = multiple && index === 0;
            const isBeingDragged = draggedIndex === index;
            const isDropTarget = dragOverIndex === index && draggedIndex !== index;

            return (
              <div
                key={`${url}-${index}`}
                draggable={multiple && urls.length > 1}
                onDragStart={() => setDraggedIndex(index)}
                onDragOver={(e) => {
                  if (draggedIndex === null) return;
                  e.preventDefault();
                  setDragOverIndex(index);
                }}
                onDragLeave={() => {
                  if (dragOverIndex === index) setDragOverIndex(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (draggedIndex !== null && draggedIndex !== index) {
                    moveItem(draggedIndex, index);
                  }
                  setDraggedIndex(null);
                  setDragOverIndex(null);
                }}
                onDragEnd={() => {
                  setDraggedIndex(null);
                  setDragOverIndex(null);
                }}
                className={cn(
                  "group relative overflow-hidden rounded-xl border bg-cream transition-all",
                  isCover ? "border-gold-400 ring-2 ring-gold-300/60" : "border-sand-200",
                  multiple && urls.length > 1 && "cursor-grab active:cursor-grabbing",
                  isBeingDragged && "opacity-50",
                  isDropTarget && "ring-2 ring-forest-500"
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Uploaded image ${index + 1}`} className="h-32 w-full object-cover" />

                {multiple ? (
                  <div className="absolute left-1.5 top-1.5 flex items-center gap-1">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide shadow-sm",
                        isCover
                          ? "bg-gold-500 text-forest-950"
                          : "bg-forest-950/75 text-cream"
                      )}
                    >
                      {isCover ? "Cover" : `#${index + 1}`}
                    </span>
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={() => removeAt(index)}
                  className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-forest-950/75 text-cream transition-colors hover:bg-soil-700"
                  aria-label={`Remove image ${index + 1}`}
                >
                  <X className="h-4 w-4" />
                </button>

                {multiple && urls.length > 1 ? (
                  <div className="flex items-center justify-between gap-1 border-t border-sand-200 bg-white/95 px-2 py-1.5">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveItem(index, index - 1)}
                        disabled={index === 0}
                        className="flex h-6 w-6 items-center justify-center rounded-md text-forest-800 transition-colors hover:bg-forest-100 disabled:opacity-30"
                        aria-label={`Move image ${index + 1} left`}
                        title="Move left"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveItem(index, index + 1)}
                        disabled={index === urls.length - 1}
                        className="flex h-6 w-6 items-center justify-center rounded-md text-forest-800 transition-colors hover:bg-forest-100 disabled:opacity-30"
                        aria-label={`Move image ${index + 1} right`}
                        title="Move right"
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {!isCover ? (
                      <button
                        type="button"
                        onClick={() => setAsCover(index)}
                        className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium text-forest-700 transition-colors hover:bg-gold-100 hover:text-forest-950"
                        title="Make cover photo"
                      >
                        <Star className="h-3 w-3 text-gold-600" aria-hidden />
                        Set cover
                      </button>
                    ) : (
                      <span className="px-1 text-[11px] font-medium text-gold-700">Primary</span>
                    )}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}

      <input type="hidden" name={name} value={multiple ? JSON.stringify(urls) : urls[0] ?? ""} />
    </div>
  );
}
