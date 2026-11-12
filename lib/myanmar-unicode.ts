/**
 * Myanmar Unicode Normalization Utility
 *
 * Automatically corrects common typing errors, out-of-sequence vowels and medials
 * (e.g. typing e-vowel \u1031 before medial ya \u103B which causes the dotted circle 'စေ◌ျး'),
 * and cleans stray dotted circles (U+25CC) so Myanmar Unicode text renders seamlessly
 * with the official Pyidaungsu font.
 */

export function normalizeMyanmarUnicode(text: string): string {
  if (!text || typeof text !== "string") return text;

  return text
    // 1. Remove stray dotted circle glyphs (U+25CC)
    .replace(/\u25CC/g, "")
    // 2. Fix e-vowel (\u1031) placed before medials (\u103B - \u103E)
    // Example: စ + ေ + ျ + း (broken: စေ◌ျး) -> စ + ျ + ေ + း (correct: စျေး)
    .replace(/(\u1031)([\u103B-\u103E]+)/g, (_m, vowel, medials) => medials + vowel)
    // 3. Fix e-vowel placed before upper vowels (\u102D, \u102E, \u1032)
    .replace(/(\u1031)([\u102D\u102E\u1032]+)/g, (_m, vowel, upperVowels) => upperVowels + vowel)
    // 4. Fix e-vowel placed before lower vowels (\u102F, \u1030)
    .replace(/(\u1031)([\u102F\u1030]+)/g, (_m, vowel, lowerVowels) => lowerVowels + vowel)
    // 5. Fix aukmyit (\u1037) placed before asat (\u103A)
    .replace(/(\u1037)(\u103A)/g, (_m, _auk, asat) => asat + "\u1037")
    // 6. Fix double asat / duplicate diacritics
    .replace(/\u103A{2,}/g, "\u103A")
    .replace(/\u1037{2,}/g, "\u1037")
    .replace(/\u1038{2,}/g, "\u1038");
}

