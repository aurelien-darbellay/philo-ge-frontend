import { useEffect, useState } from "react";
import { api } from "../api";
import type { PublicCycle, PublicEvent } from "../types";

type ArchivesState = {
  cycles: PublicCycle[];
  standaloneEvents: PublicEvent[];
  loading: boolean;
  failed: boolean;
};

export function useArchives(from: string, to: string): ArchivesState {
  const [state, setState] = useState<ArchivesState>({ cycles: [], standaloneEvents: [], loading: true, failed: false });

  useEffect(() => {
    let active = true;

    if (!from || !to || from > to) {
      setState({ cycles: [], standaloneEvents: [], loading: false, failed: false });
      return () => {
        active = false;
      };
    }

    setState((current) => ({ ...current, loading: true, failed: false }));
    void Promise.all([api.cycles(from, to), api.events(from, to)])
      .then(([cycleResponse, eventResponse]) => {
        if (!active) return;
        setState({
          cycles: [...cycleResponse.cycles].sort((left, right) =>
            (right.starts_on ?? right.ends_on ?? "").localeCompare(left.starts_on ?? left.ends_on ?? "")),
          standaloneEvents: eventResponse.events
            .filter((event) => event.cycle === null)
            .sort((left, right) => right.starts_at.localeCompare(left.starts_at)),
          loading: false,
          failed: false,
        });
      })
      .catch(() => {
        if (active) setState({ cycles: [], standaloneEvents: [], loading: false, failed: true });
      });

    return () => {
      active = false;
    };
  }, [from, to]);

  return state;
}
