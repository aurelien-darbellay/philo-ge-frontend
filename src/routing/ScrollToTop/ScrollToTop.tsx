import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function ScrollToTop() {
  const { pathname, hash, key } = useLocation();

  useEffect(() => {
    let observer: ResizeObserver | undefined;
    let frame = 0;
    const stopTracking = () => {
      observer?.disconnect();
      cancelAnimationFrame(frame);
    };
    const scroll = () => {
      let target: HTMLElement | null = null;
      try {
        target = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
      } catch {
        // Malformed fragments behave like an unknown anchor.
      }
      if (target) {
        const header = document.querySelector("header");
        const offset = header?.getBoundingClientRect().height ?? 0;
        window.scrollTo({ top: Math.max(0, window.scrollY + target.getBoundingClientRect().top - offset), left: 0, behavior: "instant" });
      } else {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      }
    };
    frame = requestAnimationFrame(scroll);
    if (hash) {
      // Keep the anchor aligned when content above it loads asynchronously.
      observer = new ResizeObserver(() => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(scroll);
      });
      observer.observe(document.body);
      document.querySelectorAll("main, header").forEach((element) => observer?.observe(element));
      window.addEventListener("wheel", stopTracking, { passive: true });
      window.addEventListener("touchstart", stopTracking, { passive: true });
      window.addEventListener("keydown", stopTracking);
      window.addEventListener("pointerdown", stopTracking);
    }
    return () => {
      stopTracking();
      window.removeEventListener("wheel", stopTracking);
      window.removeEventListener("touchstart", stopTracking);
      window.removeEventListener("keydown", stopTracking);
      window.removeEventListener("pointerdown", stopTracking);
    };
  }, [pathname, hash, key]);

  return null;
}
