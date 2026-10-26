import { useEffect, useLayoutEffect, useRef } from "react";

// Calls the latest `handler` for every keydown on the page, except while typing.
export default function useKeydown(handler) {
  const ref = useRef(handler);
  useLayoutEffect(() => {
    ref.current = handler;
  });
  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.target.closest?.("input, textarea, select")) return;
      ref.current(e);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
}

// Enter on a focused control other than an answer or the main action should keep its
// native behaviour (e.g. a focused Flag button flags instead of checking the answer).
export const isOtherButton = (e) =>
  !!e.target.closest?.("button") && !e.target.closest(".opt") && e.target.id !== "act-main";
