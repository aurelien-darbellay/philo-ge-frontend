import { useEffect, useState } from "react";
import { api } from "../api";
import type { PublicCycle } from "../types";

type CycleState = {
  cycle: PublicCycle | null;
  loading: boolean;
  failed: boolean;
};

export function usePublicCycle(id: number | null): CycleState {
  const [state, setState] = useState<CycleState>({ cycle: null, loading: true, failed: false });

  useEffect(() => {
    let active = true;

    if (id === null) {
      setState({ cycle: null, loading: false, failed: true });
      return () => {
        active = false;
      };
    }

    setState({ cycle: null, loading: true, failed: false });
    void api.cycle(id)
      .then(({ cycle }) => {
        if (active) setState({ cycle, loading: false, failed: false });
      })
      .catch(() => {
        if (active) setState({ cycle: null, loading: false, failed: true });
      });

    return () => {
      active = false;
    };
  }, [id]);

  return state;
}
