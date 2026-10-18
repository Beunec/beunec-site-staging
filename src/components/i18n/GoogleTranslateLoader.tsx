'use client'

import { useEffect } from 'react'
import { applyCountryLanguage, GOOGLE_INCLUDED_LANGUAGES } from '@/lib/pageLanguage'

declare global {
  interface Window {
    googleTranslateElementInit?: () => void
    google?: {
      translate?: {
        TranslateElement: new (
          options: { pageLanguage: string; includedLanguages: string; autoDisplay: boolean },
          elementId: string,
        ) => unknown
      }
    }
  }
}

/**
 * The widget swaps text nodes for its own <font> elements. When React later
 * removes or inserts next to a node it rendered, the node's parent is no
 * longer the one React expects and the DOM call throws, taking the page down
 * (facebook/react#11538). Only while a translation is active, those two calls
 * tolerate a moved node instead of throwing.
 */
function tolerateTranslatedNodes() {
  const proto = Node.prototype as Node & { __aseliusTranslateGuard?: boolean }
  if (proto.__aseliusTranslateGuard) return
  proto.__aseliusTranslateGuard = true
  const removeChild = proto.removeChild
  proto.removeChild = function <T extends Node>(this: Node, child: T): T {
    if (child.parentNode !== this) return child
    return removeChild.call(this, child) as T
  }
  const insertBefore = proto.insertBefore
  proto.insertBefore = function <T extends Node>(this: Node, node: T, ref: Node | null): T {
    if (ref && ref.parentNode !== this) return insertBefore.call(this, node, null) as T
    return insertBefore.call(this, node, ref) as T
  }
}

/**
 * Text the translator must leave alone: product names (a translated "Rivine
 * TaskForce" reads as a different product) and file names (a translated
 * "customer_ids.csv" no longer matches the file the person downloads).
 * Checked per text node as it appears, before Google's own observer sees it.
 */
const PRODUCT_NAME = /\b(Aselius|Rivine|Selius|TaskForce|Beunec)\b/
const FILE_NAME = /^[^\s/\\][^\n]{0,200}\.[A-Za-z0-9]{1,6}$/

function keepNamesFor(root: Node) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  for (let node = walker.currentNode; node; node = walker.nextNode() as Node) {
    if (node.nodeType !== Node.TEXT_NODE) continue
    const parent = node.parentElement
    if (!parent || parent.classList.contains('notranslate')) continue
    // Only an element whose whole text is the name: a short product label
    // ("Rivine TaskForce", "Rivine Code · Full Stack") or a file name. A
    // sentence that mentions a product is still translated.
    const whole = (parent.textContent || '').trim()
    if (!whole || whole.length > 200) continue
    if ((whole.length <= 48 && PRODUCT_NAME.test(whole) && !/[.!?:]$/.test(whole)) || FILE_NAME.test(whole)) {
      parent.classList.add('notranslate')
      parent.setAttribute('translate', 'no')
    }
  }
}

function keepNames() {
  keepNamesFor(document.body)
  new MutationObserver((records) => {
    for (const r of records) {
      if (r.type === 'characterData' && r.target.parentNode) keepNamesFor(r.target.parentNode)
      r.addedNodes.forEach((n) => keepNamesFor(n))
    }
  }).observe(document.body, { childList: true, subtree: true, characterData: true })
}

/**
 * The widget does not always apply its cookie on its own (its auto-start runs
 * in an inline frame script). Choosing the language in its own hidden <select>
 * is the documented way to start a translation, so do that once it exists.
 */
function selectInWidget(code: string, tries = 60) {
  const combo = document.querySelector<HTMLSelectElement>('select.goog-te-combo')
  if (!combo || !Array.from(combo.options).some((o) => o.value === code)) {
    if (tries > 0) window.setTimeout(() => selectInWidget(code, tries - 1), 250)
    return
  }
  if (combo.value === code) return
  combo.value = code
  combo.dispatchEvent(new Event('change'))
}

/**
 * Loads the Google Website Translator only when the page is not in English:
 * the person chose another language, or (with no choice yet) their country's
 * language applies. English visitors never download the script. The widget's
 * own bar stays off-screen; the existing language menu is the control.
 */
export function GoogleTranslateLoader() {
  useEffect(() => {
    let cancelled = false
    void applyCountryLanguage().then((code) => {
      if (cancelled || code === 'en') return
      if (document.getElementById('google-translate-script')) return
      tolerateTranslatedNodes()
      keepNames()

      window.googleTranslateElementInit = () => {
        if (!window.google?.translate) return
        new window.google.translate.TranslateElement(
          { pageLanguage: 'en', includedLanguages: GOOGLE_INCLUDED_LANGUAGES, autoDisplay: false },
          'google_translate_element',
        )
        selectInWidget(code)
      }

      const script = document.createElement('script')
      script.id = 'google-translate-script'
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
      script.async = true
      document.body.appendChild(script)
    })
    return () => { cancelled = true }
  }, [])

  return <div id="google_translate_element" className="sr-only" aria-hidden="true" />
}
