import { useEffect, useState } from "react";
import { api } from "../api";
import type { PublicCycle, PublicEvent } from "../types";

export type FeaturedContent =
  | { kind: "cycle"; value: PublicCycle }
  | { kind: "event"; value: PublicEvent };

export function useFeaturedContent(): FeaturedContent | null {
  const [content, setContent] = useState<FeaturedContent | null>(null);

  useEffect(() => {
    let active = true;

    void Promise.allSettled([api.highlightedCycle(), api.highlightedEvent()]).then(([cycleResult, eventResult]) => {
      if (!active) return;

      const cycle = cycleResult.status === "fulfilled" ? cycleResult.value.cycle : null;
      const event = eventResult.status === "fulfilled" ? eventResult.value.event : null;

      if (cycle) setContent({ kind: "cycle", value: cycle });
      else if (event) setContent({ kind: "event", value: event });
      else setContent(null);
    });

    return () => {
      active = false;
    };
  }, []);

  return content;
}
