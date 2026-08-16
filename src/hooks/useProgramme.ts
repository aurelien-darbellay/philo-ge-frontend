import { useEffect, useState } from "react";
import { api } from "../api";
import type { PublicCycle, PublicEvent } from "../types";

type ProgrammeState = {
  cycles: PublicCycle[];
  standaloneEvents: PublicEvent[];
  showingPast: boolean;
  loading: boolean;
  failed: boolean;
};

export function useProgramme(): ProgrammeState {
  const [state, setState] = useState<ProgrammeState>({ cycles: [], standaloneEvents: [], showingPast: false, loading: true, failed: false });

  useEffect(() => {
    let active = true;
    const today = new Date();
    const oneYearFromToday = new Date(today);
    oneYearFromToday.setUTCFullYear(oneYearFromToday.getUTCFullYear() + 1);
    const oneYearBeforeToday = new Date(today);
    oneYearBeforeToday.setUTCFullYear(oneYearBeforeToday.getUTCFullYear() - 1);
    const todayValue = today.toISOString().slice(0, 10);
    const futureValue = oneYearFromToday.toISOString().slice(0, 10);
    const pastValue = oneYearBeforeToday.toISOString().slice(0, 10);

    const loadRange = async (from: string, to: string, showingPast: boolean): Promise<ProgrammeState> => {
      const [cycleResponse, eventResponse] = await Promise.all([api.cycles(from, to), api.events(from, to)]);
      const inRange = (event: PublicEvent) => event.starts_at >= from && event.starts_at < to;
      const direction = showingPast ? -1 : 1;
      return {
        cycles: cycleResponse.cycles
          .map((cycle) => ({ ...cycle, events: cycle.events.filter(inRange) }))
          .filter((cycle) => cycle.events.length > 0)
          .sort((left, right) => direction * (left.starts_on ?? left.ends_on ?? "").localeCompare(right.starts_on ?? right.ends_on ?? "")),
        standaloneEvents: eventResponse.events
          .filter((event) => event.cycle === null)
          .sort((left, right) => direction * left.starts_at.localeCompare(right.starts_at)),
        showingPast,
        loading: false,
        failed: false,
      };
    };

    void loadRange(todayValue, futureValue, false)
      .then((future) => future.cycles.length > 0 || future.standaloneEvents.length > 0
        ? future
        : loadRange(pastValue, todayValue, true))
      .then((programme) => {
        if (active) setState(programme);
      })
      .catch(() => {
        if (active) setState({ cycles: [], standaloneEvents: [], showingPast: false, loading: false, failed: true });
      });

    return () => {
      active = false;
    };
  }, []);

  return state;
}
