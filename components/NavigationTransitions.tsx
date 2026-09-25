"use client";

import { useEffect } from "react";

const APP_EXIT_DURATION_MS = 1_200;
const APP_EXIT_EVENT = "animationend";
let pendingAppTransition: Promise<void> | null = null;

export function transitionBeforeAppNavigation(destinationHref: string) {
  if (typeof window === "undefined" || typeof document === "undefined") return Promise.resolve();
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return Promise.resolve();

  let target: URL;
  try {
    target = new URL(destinationHref, window.location.href);
  } catch {
    return Promise.resolve();
  }
  if (target.origin === window.location.origin) return Promise.resolve();
  if (pendingAppTransition) return pendingAppTransition;

  const root = document.documentElement;
  root.classList.remove("hiu-app-exit");
  void root.offsetWidth;
  root.classList.add("hiu-app-exit");

  pendingAppTransition = new Promise<void>((resolve) => {
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      root.removeEventListener(APP_EXIT_EVENT, onAnimationEnd);
      window.clearTimeout(fallback);
      root.classList.remove("hiu-app-exit");
      pendingAppTransition = null;
      resolve();
    };
    const onAnimationEnd = (event: AnimationEvent) => {
      if (event.target === root && event.animationName === "hiu-app-exit") finish();
    };
    const fallback = window.setTimeout(finish, APP_EXIT_DURATION_MS + 150);
    root.addEventListener(APP_EXIT_EVENT, onAnimationEnd);
  });
  return pendingAppTransition;
}

export default function NavigationTransitions() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest<HTMLAnchorElement>("a[data-app-transition]");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      let destination: URL;
      try {
        destination = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }
      if (destination.origin === window.location.origin) return;

      event.preventDefault();
      void transitionBeforeAppNavigation(destination.toString()).then(() => window.location.assign(destination.toString()));
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
