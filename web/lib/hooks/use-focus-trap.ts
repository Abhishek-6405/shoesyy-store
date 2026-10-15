"use client";

import { useEffect, useRef, useState } from "react";

const focusable = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function useFocusTrap(open: boolean, onClose: () => void, mediaQuery?: string) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const [matches, setMatches] = useState(true);

  useEffect(() => {
    if (!mediaQuery) return;
    const query = matchMedia(mediaQuery);
    const update = () => setMatches(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, [mediaQuery]);

  useEffect(() => {
    const panel = ref.current;
    if (!open || !panel || !matches || (mediaQuery && !matchMedia(mediaQuery).matches)) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const hidden: { element: HTMLElement; inert: boolean }[] = [];
    let current: HTMLElement = panel;
    while (current.parentElement && current !== document.body) {
      for (const sibling of Array.from(current.parentElement.children)) {
        if (sibling instanceof HTMLElement && sibling !== current && !sibling.hasAttribute("data-focus-backdrop") && !["SCRIPT", "STYLE"].includes(sibling.tagName)) {
          hidden.push({ element: sibling, inert: sibling.inert });
          sibling.inert = true;
        }
      }
      current = current.parentElement;
    }
    const targets = () => Array.from(panel.querySelectorAll<HTMLElement>(focusable))
      .filter((element) => element.getClientRects().length > 0 && !element.closest("[inert]"));
    const focusFirst = () => (targets()[0] || panel).focus();
    const frame = requestAnimationFrame(focusFirst);
    function keydown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeRef.current();
      } else if (event.key === "Tab") {
        const elements = targets();
        const first = elements[0];
        const last = elements[elements.length - 1];
        if (!first) {
          event.preventDefault();
          panel?.focus();
        } else if (event.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }
    function focusin(event: FocusEvent) {
      if (!panel?.contains(event.target as Node)) focusFirst();
    }
    document.addEventListener("keydown", keydown);
    document.addEventListener("focusin", focusin);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", keydown);
      document.removeEventListener("focusin", focusin);
      hidden.forEach(({ element, inert }) => { element.inert = inert; });
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [open, mediaQuery, matches]);
  return ref;
}
