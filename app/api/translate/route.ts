import { NextResponse } from "next/server";
import { englishToMyanmarMap, myanmarToEnglishMap } from "@/lib/translations-dict";

const memoryCache = new Map<string, string>();

function getFromDictionary(trimmed: string, target: "my" | "en"): string | null {
  if (target === "my") {
    if (englishToMyanmarMap && englishToMyanmarMap[trimmed]) {
      return englishToMyanmarMap[trimmed];
    }
    const lower = trimmed.toLowerCase();
    if (englishToMyanmarMap) {
      for (const [k, v] of Object.entries(englishToMyanmarMap)) {
        if (k.toLowerCase() === lower) return v;
      }
    }
  } else {
    if (myanmarToEnglishMap && myanmarToEnglishMap[trimmed]) {
      return myanmarToEnglishMap[trimmed];
    }
  }
  return null;
}

async function translateSingle(text: string, target: "my" | "en"): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) return text;

  const cacheKey = `${target}:${trimmed}`;
  if (memoryCache.has(cacheKey)) {
    return memoryCache.get(cacheKey)!;
  }

  // 1. Check curated domain dictionary first
  const fromDict = getFromDictionary(trimmed, target);
  if (fromDict) {
    memoryCache.set(cacheKey, fromDict);
    return fromDict;
  }

  // 2. Automated translation via Google Translate endpoint
  const source = target === "my" ? "en" : "my";
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${source}&tl=${target}&dt=t&q=${encodeURIComponent(
    trimmed
  )}`;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      console.warn(`[AutoTranslate] upstream HTTP ${res.status} for text: "${trimmed}"`);
      return trimmed;
    }

    const data = await res.json();
    if (Array.isArray(data) && Array.isArray(data[0])) {
      const translated = data[0]
        .map((chunk: unknown) => (Array.isArray(chunk) ? chunk[0] : ""))
        .filter(Boolean)
        .join("");
      const finalResult = translated || trimmed;
      if (finalResult && finalResult !== trimmed) {
        memoryCache.set(cacheKey, finalResult);
      }
      return finalResult;
    }
    return trimmed;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.warn("[AutoTranslate] fetch error:", msg);
    return trimmed;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const target = body.target === "en" ? "en" : "my";

    if (Array.isArray(body.texts)) {
      const results = await Promise.all(
        body.texts.map((t: unknown) => (typeof t === "string" ? translateSingle(t, target) : ""))
      );
      return NextResponse.json({ ok: true, translations: results });
    }

    if (typeof body.text === "string") {
      const result = await translateSingle(body.text, target);
      return NextResponse.json({ ok: true, translation: result });
    }

    return NextResponse.json({ ok: false, error: "Missing 'text' or 'texts' field" }, { status: 400 });
  } catch (error) {
    console.error("[POST /api/translate] error:", error);
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}
