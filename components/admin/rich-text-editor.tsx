"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import {
  Bold,
  Code,
  Eye,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  PenTool,
  Quote,
  Redo2,
  RemoveFormatting,
  Underline,
  Undo2,
  Unlink,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

type RichTextEditorProps = {
  name?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
};

export function RichTextEditor({
  name = "body",
  defaultValue = "",
  value,
  onChange,
  placeholder = "Write your article content here...",
  minHeight = "360px",
}: RichTextEditorProps) {
  const [mode, setMode] = useState<"visual" | "html" | "preview">("visual");
  const [content, setContent] = useState<string>(value ?? defaultValue);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const editorRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isInternalChangeRef = useRef(false);

  // Sync content with value if provided externally
  useEffect(() => {
    if (value !== undefined && value !== content && !isInternalChangeRef.current) {
      setContent(value);
      if (editorRef.current && mode === "visual") {
        editorRef.current.innerHTML = value;
      }
    }
    isInternalChangeRef.current = false;
  }, [value, content, mode]);

  // Set initial content on mount
  useEffect(() => {
    if (editorRef.current && (defaultValue || value)) {
      editorRef.current.innerHTML = value ?? defaultValue;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const notifyChange = useCallback(
    (newHtml: string) => {
      isInternalChangeRef.current = true;
      setContent(newHtml);
      onChange?.(newHtml);
    },
    [onChange]
  );

  const handleVisualInput = useCallback(() => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      notifyChange(html);
    }
  }, [notifyChange]);

  const handleTextareaChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const html = e.target.value;
      notifyChange(html);
    },
    [notifyChange]
  );

  const executeCommand = useCallback(
    (command: string, value: string | undefined = undefined) => {
      if (mode !== "visual" || !editorRef.current) return;
      editorRef.current.focus();
      document.execCommand(command, false, value);
      handleVisualInput();
    },
    [mode, handleVisualInput]
  );

  const handleToolbarClick = (
    e: MouseEvent,
    command: string,
    value: string | undefined = undefined
  ) => {
    e.preventDefault();
    executeCommand(command, value);
  };

  const openLinkDialog = (e: MouseEvent) => {
    e.preventDefault();
    if (mode !== "visual") return;
    setLinkUrl("");
    setShowLinkModal(true);
  };

  const applyLink = () => {
    if (!linkUrl.trim()) {
      setShowLinkModal(false);
      return;
    }
    const formattedUrl =
      linkUrl.startsWith("http://") || linkUrl.startsWith("https://") || linkUrl.startsWith("mailto:")
        ? linkUrl
        : `https://${linkUrl}`;
    executeCommand("createLink", formattedUrl);
    setShowLinkModal(false);
    setLinkUrl("");
  };

  const removeLink = (e: MouseEvent) => {
    e.preventDefault();
    executeCommand("unlink");
  };

  const handleModeSwitch = (newMode: "visual" | "html" | "preview") => {
    if (newMode === mode) return;
    if (mode === "visual" && editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
    setMode(newMode);
    if (newMode === "visual") {
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.innerHTML = content;
          editorRef.current.focus();
        }
      }, 0);
    }
  };

  // Word count & reading time calculations
  const plainText = content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const wordCount = plainText ? plainText.split(/\s+/).length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="relative rounded-2xl border border-sand-300 bg-white shadow-xs focus-within:border-gold-500 focus-within:ring-2 focus-within:ring-gold-400/20">
      {/* Hidden input for form submission */}
      <input type="hidden" name={name} value={content} />

      {/* Editor Header / Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sand-200 bg-sand-50/70 px-3 py-2">
        {/* Mode switcher tabs */}
        <div className="inline-flex items-center rounded-xl bg-sand-200/60 p-0.5 text-xs font-medium">
          <button
            type="button"
            onClick={() => handleModeSwitch("visual")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 transition",
              mode === "visual"
                ? "bg-white text-forest-950 shadow-xs font-semibold"
                : "text-forest-700/70 hover:text-forest-950"
            )}
          >
            <PenTool className="h-3.5 w-3.5" />
            Visual Editor
          </button>
          <button
            type="button"
            onClick={() => handleModeSwitch("html")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 transition",
              mode === "html"
                ? "bg-white text-forest-950 shadow-xs font-semibold"
                : "text-forest-700/70 hover:text-forest-950"
            )}
          >
            <Code className="h-3.5 w-3.5" />
            HTML
          </button>
          <button
            type="button"
            onClick={() => handleModeSwitch("preview")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 transition",
              mode === "preview"
                ? "bg-white text-forest-950 shadow-xs font-semibold"
                : "text-forest-700/70 hover:text-forest-950"
            )}
          >
            <Eye className="h-3.5 w-3.5" />
            Preview
          </button>
        </div>

        {/* Action icons / Stats */}
        <div className="flex items-center gap-3 text-xs text-forest-600/75">
          <span>{wordCount} words</span>
          <span>•</span>
          <span>~{readingTime} min read</span>
        </div>
      </div>

      {/* Visual Formatting Toolbar (only in visual mode) */}
      {mode === "visual" && (
        <div className="flex flex-wrap items-center gap-1 border-b border-sand-200/70 bg-sand-50/30 px-3 py-1.5 text-forest-800">
          <button
            type="button"
            title="Heading 2"
            onMouseDown={(e) => handleToolbarClick(e, "formatBlock", "<h2>")}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-sand-200/70 hover:text-forest-950 transition"
          >
            <Heading2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="Heading 3"
            onMouseDown={(e) => handleToolbarClick(e, "formatBlock", "<h3>")}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-sand-200/70 hover:text-forest-950 transition"
          >
            <Heading3 className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="Paragraph"
            onMouseDown={(e) => handleToolbarClick(e, "formatBlock", "<p>")}
            className="inline-flex h-8 px-2 items-center justify-center rounded-lg text-xs font-semibold hover:bg-sand-200/70 hover:text-forest-950 transition"
          >
            P
          </button>

          <div className="mx-1 h-4 w-px bg-sand-200" />

          <button
            type="button"
            title="Bold (Ctrl+B)"
            onMouseDown={(e) => handleToolbarClick(e, "bold")}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-sand-200/70 hover:text-forest-950 transition"
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="Italic (Ctrl+I)"
            onMouseDown={(e) => handleToolbarClick(e, "italic")}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-sand-200/70 hover:text-forest-950 transition"
          >
            <Italic className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="Underline (Ctrl+U)"
            onMouseDown={(e) => handleToolbarClick(e, "underline")}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-sand-200/70 hover:text-forest-950 transition"
          >
            <Underline className="h-4 w-4" />
          </button>

          <div className="mx-1 h-4 w-px bg-sand-200" />

          <button
            type="button"
            title="Bullet List"
            onMouseDown={(e) => handleToolbarClick(e, "insertUnorderedList")}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-sand-200/70 hover:text-forest-950 transition"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="Numbered List"
            onMouseDown={(e) => handleToolbarClick(e, "insertOrderedList")}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-sand-200/70 hover:text-forest-950 transition"
          >
            <ListOrdered className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="Blockquote"
            onMouseDown={(e) => handleToolbarClick(e, "formatBlock", "<blockquote>")}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-sand-200/70 hover:text-forest-950 transition"
          >
            <Quote className="h-4 w-4" />
          </button>

          <div className="mx-1 h-4 w-px bg-sand-200" />

          <button
            type="button"
            title="Add Link"
            onMouseDown={openLinkDialog}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-sand-200/70 hover:text-forest-950 transition"
          >
            <Link2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="Remove Link"
            onMouseDown={removeLink}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-sand-200/70 hover:text-forest-950 transition"
          >
            <Unlink className="h-3.5 w-3.5" />
          </button>

          <div className="mx-1 h-4 w-px bg-sand-200" />

          <button
            type="button"
            title="Clear Formatting"
            onMouseDown={(e) => handleToolbarClick(e, "removeFormat")}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-sand-200/70 hover:text-forest-950 transition"
          >
            <RemoveFormatting className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="Undo"
            onMouseDown={(e) => handleToolbarClick(e, "undo")}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-sand-200/70 hover:text-forest-950 transition"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            title="Redo"
            onMouseDown={(e) => handleToolbarClick(e, "redo")}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-sand-200/70 hover:text-forest-950 transition"
          >
            <Redo2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Editor Body */}
      <div className="relative">
        {mode === "visual" && (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleVisualInput}
            style={{ minHeight }}
            data-placeholder={placeholder}
            className={cn(
              "rich-text p-5 focus:outline-none",
              "[&:empty]:before:text-forest-700/40 [&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:pointer-events-none"
            )}
          />
        )}

        {mode === "html" && (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleTextareaChange}
            style={{ minHeight }}
            placeholder="<p>Write raw HTML here...</p>"
            className="w-full resize-y bg-transparent p-5 font-mono text-xs leading-relaxed text-forest-950 focus:outline-none"
          />
        )}

        {mode === "preview" && (
          <div
            style={{ minHeight }}
            className="p-6 bg-sand-50/50 rounded-b-2xl border-t border-sand-100"
          >
            {content.trim() ? (
              <div
                className="rich-text"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            ) : (
              <p className="text-sm italic text-forest-700/50">
                Nothing to preview yet. Start typing your article in the Visual Editor.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Link Dialog Modal */}
      {showLinkModal && (
        <div className="absolute inset-x-4 top-14 z-20 mx-auto max-w-md rounded-2xl border border-sand-300 bg-white p-4 shadow-xl">
          <div className="flex items-center justify-between pb-2">
            <h4 className="text-xs font-semibold text-forest-950">Insert Link</h4>
            <button
              type="button"
              onClick={() => setShowLinkModal(false)}
              className="text-forest-400 hover:text-forest-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <input
              type="text"
              autoFocus
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  applyLink();
                } else if (e.key === "Escape") {
                  setShowLinkModal(false);
                }
              }}
              placeholder="https://example.com or mailto:info@..."
              className="input-admin text-xs flex-1"
            />
            <button
              type="button"
              onClick={applyLink}
              className="rounded-xl bg-forest-700 px-3.5 py-2 text-xs font-semibold text-cream hover:bg-forest-800 transition"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

