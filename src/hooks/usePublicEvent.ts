import { useEffect, useState } from "react";
import { api } from "../api";
import type { PublicEvent } from "../types";

type EventState = {
  event: PublicEvent | null;
  loading: boolean;
  failed: boolean;
};

export function usePublicEvent(id: number | null): EventState {
  const [state, setState] = useState<EventState>({ event: null, loading: true, failed: false });

  useEffect(() => {
    let active = true;

    if (id === null) {
      setState({ event: null, loading: false, failed: true });
      return () => {
        active = false;
      };
    }

    setState({ event: null, loading: true, failed: false });
    void api.event(id)
      .then(({ event }) => {
        if (active) setState({ event, loading: false, failed: false });
      })
      .catch(() => {
        if (active) setState({ event: null, loading: false, failed: true });
      });

    return () => {
      active = false;
    };
  }, [id]);

  return state;
}
