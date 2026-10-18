/**
 * Page language for the Google Website Translator widget.
 * The choice is a cookie plus localStorage. It is never sent to a Rivine engine.
 *
 * Only languages Google Translate supports are offered: a label Google cannot
 * translate to would leave the page in English while the menu claimed otherwise.
 * The preview site (Aselius-Preview-Site/public/js/theme.js) carries the same
 * list; tests/page-language.test.mjs keeps the two equal.
 */

export const PAGE_LANGUAGE_STORAGE_KEY = 'aselius_selected_language'
/** The language picked from the visitor's country, kept apart from a real choice. */
export const GEO_LANGUAGE_STORAGE_KEY = 'aselius_geo_language'
/** Fired on window when the page language is set without a reload. */
export const PAGE_LANGUAGE_EVENT = 'aselius:page-language'

/** Menu label → Google language code. */
export const PAGE_LANGUAGES: Record<string, string> = {
  English: 'en',
  Spanish: 'es',
  French: 'fr',
  German: 'de',
  Italian: 'it',
  Portuguese: 'pt',
  Russian: 'ru',
  Ukrainian: 'uk',
  'Chinese (Simplified)': 'zh-CN',
  'Chinese (Traditional)': 'zh-TW',
  Japanese: 'ja',
  Korean: 'ko',
  Arabic: 'ar',
  Hindi: 'hi',
  Turkish: 'tr',
  Dutch: 'nl',
  Swedish: 'sv',
  Norwegian: 'no',
  Danish: 'da',
  Finnish: 'fi',
  Polish: 'pl',
  Czech: 'cs',
  Hungarian: 'hu',
  Romanian: 'ro',
  Bulgarian: 'bg',
  Croatian: 'hr',
  Serbian: 'sr',
  Slovak: 'sk',
  Slovenian: 'sl',
  Estonian: 'et',
  Latvian: 'lv',
  Lithuanian: 'lt',
  Greek: 'el',
  Hebrew: 'iw',
  Persian: 'fa',
  Urdu: 'ur',
  Bengali: 'bn',
  Tamil: 'ta',
  Telugu: 'te',
  Marathi: 'mr',
  Gujarati: 'gu',
  Kannada: 'kn',
  Malayalam: 'ml',
  Punjabi: 'pa',
  Thai: 'th',
  Vietnamese: 'vi',
  Indonesian: 'id',
  Malay: 'ms',
  Filipino: 'tl',
  Swahili: 'sw',
  Yoruba: 'yo',
  Igbo: 'ig',
  Hausa: 'ha',
  Amharic: 'am',
  Nepali: 'ne',
  Sinhala: 'si',
  Mongolian: 'mn',
  Kurdish: 'ku',
}

export const PAGE_LANGUAGE_LABELS = Object.keys(PAGE_LANGUAGES)

/** The owner's list (2026-10-17). Every other country starts in English. */
export const COUNTRY_LANGUAGE: Record<string, string> = {
  FR: 'fr', ES: 'es', US: 'en', GB: 'en', CN: 'zh-CN', IN: 'hi', SA: 'ar', IT: 'it',
  RU: 'ru', RO: 'ro', UA: 'uk', BR: 'pt', MX: 'es', CA: 'en',
}

export const GOOGLE_INCLUDED_LANGUAGES = PAGE_LANGUAGE_LABELS.map((l) => PAGE_LANGUAGES[l])
  .filter((code) => code !== 'en')
  .join(',')

export function googleCodeFor(label: string): string {
  return PAGE_LANGUAGES[label] ?? 'en'
}

export function labelForCode(code: string): string {
  return PAGE_LANGUAGE_LABELS.find((l) => PAGE_LANGUAGES[l] === code) ?? 'English'
}

/** A saved label from before the list was trimmed (e.g. "English(UK)") reads as English. */
export function normalizeLanguageLabel(label: string | null | undefined): string {
  return label && label in PAGE_LANGUAGES ? label : 'English'
}

export function languageForCountry(country: string | null | undefined): string {
  return COUNTRY_LANGUAGE[String(country || '').toUpperCase()] ?? 'en'
}

function safeGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeSet(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    /* the cookie still carries the choice */
  }
}

/** The person chose a language themselves (English included). */
export function hasExplicitLanguage(): boolean {
  return typeof window !== 'undefined' && safeGet(PAGE_LANGUAGE_STORAGE_KEY) !== null
}

export function storedPageLanguage(): string {
  if (typeof window === 'undefined') return 'English'
  const chosen = safeGet(PAGE_LANGUAGE_STORAGE_KEY)
  if (chosen) return normalizeLanguageLabel(chosen)
  const code = activeGoogleCode()
  return code === 'en' ? 'English' : labelForCode(code)
}

function readCookieCode(): string {
  const match = document.cookie.match(/(?:^|; )googtrans=([^;]*)/)
  if (!match) return 'en'
  const parts = decodeURIComponent(match[1]).split('/')
  const code = parts[2] || 'en'
  return code === 'en' ? 'en' : code
}

function clearGoogTrans() {
  const host = window.location.hostname
  const expire = 'expires=Thu, 01 Jan 1970 00:00:00 GMT'
  const domains = ['', host]
  if (host.includes('.')) domains.push(host.split('.').slice(-2).join('.'))
  for (const domain of domains) {
    const domainAttr = domain ? `;domain=${domain}` : ''
    document.cookie = `googtrans=;${expire};path=/${domainAttr}`
  }
}

function setGoogTrans(code: string) {
  clearGoogTrans()
  if (code !== 'en') document.cookie = `googtrans=/en/${code};path=/;max-age=31536000;samesite=lax`
}

/** Remember the label and apply it. Reloads only when the page language actually changes. */
export function applyPageLanguage(label: string) {
  const clean = normalizeLanguageLabel(label)
  const code = googleCodeFor(clean)
  const previousCode = readCookieCode()
  const hadChoice = hasExplicitLanguage()
  safeSet(PAGE_LANGUAGE_STORAGE_KEY, clean)
  setGoogTrans(code)
  window.dispatchEvent(new CustomEvent(PAGE_LANGUAGE_EVENT, { detail: clean }))
  if (previousCode === code && hadChoice) return
  if (previousCode === code) return
  window.location.reload()
}

/**
 * Beunec-Site is a static export (no server route to read a visitor's
 * country from), so there is no automatic country default here — only the
 * visitor's own choice, which this returns so the loader knows whether to
 * fetch Google's script at all.
 */
export async function applyCountryLanguage(): Promise<string> {
  return activeGoogleCode()
}

export function activeGoogleCode(): string {
  if (typeof document === 'undefined') return 'en'
  return readCookieCode()
}
