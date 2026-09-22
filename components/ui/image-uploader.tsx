"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { uploadImage } from "@/lib/actions/upload";

type ImageUploaderProps = {
  name: string;
  label: string;
  multiple?: boolean;
  initial?: string[];
};

export function ImageUploader({ name, label, multiple = false, initial = [] }: ImageUploaderProps) {
  const [urls, setUrls] = useState<string[]>(initial);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function removeUrl(url: string) {
    setUrls((prev) => prev.filter((u) => u !== url));
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);
    const list = Array.from(files);
    const next: string[] = [];
    try {
      for (const file of list) {
        const fd = new FormData();
        fd.append("file", file);
        const result = await uploadImage(fd);
        if (!result.ok) {
          setError(result.error);
          break;
        }
        next.push(result.url);
      }
      setUrls((prev) => (multiple ? [...prev, ...next] : next.length > 0 ? [next[0]] : prev));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-forest-900">{label}</label>

      <label
        className={`flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed bg-sand-50 px-4 py-6 text-center transition-colors ${
          uploading ? "border-gold-400" : "border-sand-300 hover:border-forest-400"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          className="sr-only"
          disabled={uploading}
          onChange={(e) => handleFiles(e.target.files)}
        />
        {uploading ? (
          <>
            <Loader2 className="h-6 w-6 animate-spin text-forest-700" aria-hidden />
            <span className="text-sm font-medium text-forest-800">Uploading…</span>
          </>
        ) : (
          <>
            <ImagePlus className="h-6 w-6 text-forest-700" aria-hidden />
            <span className="text-sm font-medium text-forest-900">
              {multiple ? "Click to upload gallery images" : "Click to upload an image"}
            </span>
            <span className="text-xs text-forest-700/60">JPG, PNG, WebP or GIF · up to 8 MB each</span>
          </>
        )}
      </label>

      {error ? (
        <p className="mt-2 text-sm text-soil-700" role="alert">{error}</p>
      ) : null}

      {urls.length > 0 ? (
        <div className={`mt-3 grid gap-3 ${multiple ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-1 md:max-w-xs"}`}>
          {urls.map((url) => (
            <div key={url} className="group relative overflow-hidden rounded-lg border border-sand-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-28 w-full object-cover" />
              <button
                type="button"
                onClick={() => removeUrl(url)}
                className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-forest-950/70 text-cream transition-colors hover:bg-soil-700"
                aria-label="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <input type="hidden" name={name} value={multiple ? JSON.stringify(urls) : urls[0] ?? ""} />
    </div>
  );
}