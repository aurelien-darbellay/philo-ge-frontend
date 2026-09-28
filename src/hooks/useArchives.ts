import { useEffect, useState } from "react";
import { api } from "../api";
import type { ArchiveResult, ArchiveSearchQuery } from "../types";

type ArchivesState = {
  results: ArchiveResult[];
  range: { from: string; to: string } | null;
  total: number;
  limit: number;
  page: number;
  pages: number;
  loading: boolean;
  failed: boolean;
};

const emptyState = (): ArchivesState => ({ results: [], range: null, total: 0, limit: 30, page: 1, pages: 1, loading: true, failed: false });

export function useArchives(query: ArchiveSearchQuery): ArchivesState {
  const [state, setState] = useState<ArchivesState>(emptyState);

  useEffect(() => {
    let active = true;

    if (query.from && query.to && query.from > query.to) {
      setState({ ...emptyState(), loading: false });
      return () => { active = false; };
    }

    setState((current) => ({ ...current, loading: true, failed: false }));
    void api.archives(query)
      .then((response) => {
        if (!active) return;
        setState({
          results: response.results,
          range: response.range,
          total: response.pagination.total,
          limit: response.pagination.limit,
          page: response.pagination.page,
          pages: response.pagination.pages,
          loading: false,
          failed: false,
        });
      })
      .catch(() => {
        if (active) setState({ ...emptyState(), loading: false, failed: true });
      });

    return () => { active = false; };
  }, [query.from, query.page, query.speaker, query.title, query.to]);

  return state;
}
