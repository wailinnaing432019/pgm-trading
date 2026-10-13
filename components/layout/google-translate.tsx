"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/i18n";

declare global {
  interface Window {
    google?: {
      translate?: {
        TranslateElement: new (options: unknown, elementId: string) => void;
      };
    };
    googleTranslateElementInit?: () => void;
  }
}

export function GoogleTranslate() {
  const { lang } = useLanguage();
  const pathname = usePathname();

  useEffect(() => {
    // 1. Setup global initialization callback for Google Translate
    window.googleTranslateElementInit = () => {
      if (window.google?.translate?.TranslateElement) {
        try {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: "en",
              includedLanguages: "en,my",
              autoDisplay: false,
            },
            "google_translate_element"
          );
        } catch (e) {
          console.warn("[GoogleTranslate] initialization error", e);
        }
      }
    };

    // 2. Inject Google Translate script if not present
    if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // 3. Whenever lang changes OR route pathname changes, re-apply translation
  useEffect(() => {
    const targetCode = lang === "my" ? "my" : "en";
    const cookieVal = lang === "my" ? "/en/my" : "/en/en";

    // Set cookie recognized by Google Translate
    document.cookie = `googtrans=${cookieVal}; path=/;`;
    if (typeof window !== "undefined" && window.location.hostname) {
      document.cookie = `googtrans=${cookieVal}; path=/; domain=${window.location.hostname};`;
      document.cookie = `googtrans=${cookieVal}; path=/; domain=.${window.location.hostname};`;
    }

    // Programmatically switch Google dropdown
    const applyTranslation = () => {
      const select = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
      if (select) {
        if (select.value !== targetCode) {
          select.value = targetCode;
          select.dispatchEvent(new Event("change"));
        } else if (targetCode === "my") {
          // If already set to 'my' but new route DOM was mounted, re-trigger
          select.dispatchEvent(new Event("change"));
        }
        return true;
      }
      return false;
    };

    applyTranslation();
    const t1 = setTimeout(applyTranslation, 250);
    const t2 = setTimeout(applyTranslation, 700);
    const t3 = setTimeout(applyTranslation, 1500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [lang, pathname]);

  return (
    <div
      id="google_translate_element"
      className="hidden"
      aria-hidden="true"
      style={{ display: "none" }}
    />
  );
}
