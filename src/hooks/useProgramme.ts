import { useEffect, useState } from "react";
import { api } from "../api";
import type { PublicCycle, PublicEvent } from "../types";

type ProgrammeState = {
  cycles: PublicCycle[];
  events: PublicEvent[];
  today: string;
  loading: boolean;
  failed: boolean;
};

function localDateValue(date: Date): string {
  const year = String(date.getFullYear()).padStart(4, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function shiftLocalYears(date: Date, years: number): Date {
  const shifted = new Date(date);
  const month = shifted.getMonth();
  shifted.setFullYear(shifted.getFullYear() + years);
  if (shifted.getMonth() !== month) shifted.setDate(0);
  return shifted;
}

export function useProgramme(): ProgrammeState {
  const initialToday = localDateValue(new Date());
  const [state, setState] = useState<ProgrammeState>({ cycles: [], events: [], today: initialToday, loading: true, failed: false });

  useEffect(() => {
    let active = true;
    const now = new Date();
    const today = localDateValue(now);
    const from = localDateValue(shiftLocalYears(now, -2));
    const to = localDateValue(shiftLocalYears(now, 5));

    void Promise.all([api.cycles(from, to), api.events(from, to)])
      .then(([cycleResponse, eventResponse]) => {
        if (active) {
          setState({
            cycles: [...cycleResponse.cycles].sort((left, right) => (left.starts_on ?? left.ends_on ?? "").localeCompare(right.starts_on ?? right.ends_on ?? "")),
            events: [...eventResponse.events].sort((left, right) => left.starts_at.localeCompare(right.starts_at)),
            today,
            loading: false,
            failed: false,
          });
        }
      })
      .catch(() => {
        if (active) setState({ cycles: [], events: [], today, loading: false, failed: true });
      });

    return () => {
      active = false;
    };
  }, []);

  return state;
}
