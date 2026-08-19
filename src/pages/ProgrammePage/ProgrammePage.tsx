import { useMemo, useState } from "react";
import { EventShelf } from "../../components/programme/EventShelf/EventShelf";
import { CycleRow } from "../../components/programme/CycleRow/CycleRow";
import { PublicHeader } from "../../components/public/PublicHeader/PublicHeader";
import { useProgramme } from "../../hooks/useProgramme";
import { useText } from "../../i18n/useText";
import { normalizeSearchValue } from "../../utils/normalizeSearchValue";
import { programmePageText } from "./ProgrammePage.text";
import styles from "./ProgrammePage.module.css";

export function ProgrammePage() {
  const text = useText(programmePageText);
  const { cycles, standaloneEvents, showingPast, loading, failed } = useProgramme();
  const [query, setQuery] = useState("");

  const normalizedQuery = normalizeSearchValue(query.trim());
  const matchesQuery = (event: (typeof standaloneEvents)[number]) => {
    if (normalizedQuery.length === 0) return true;
    return [event.title, ...event.speakers.map((speaker) => speaker.name)]
      .some((value) => normalizeSearchValue(value).includes(normalizedQuery));
  };
  const filteredCycles = useMemo(() => cycles
    .map((cycle) => ({ ...cycle, events: cycle.events.filter(matchesQuery) }))
    .filter((cycle) => cycle.events.length > 0), [cycles, normalizedQuery]);
  const filteredStandaloneEvents = useMemo(
    () => standaloneEvents.filter(matchesQuery),
    [standaloneEvents, normalizedQuery],
  );
  const hasProgramme = cycles.length > 0 || standaloneEvents.length > 0;
  const hasResults = filteredCycles.length > 0 || filteredStandaloneEvents.length > 0;

  return <div className={styles.page}>
    <PublicHeader />
    <main className={styles.main}>
      <div className={styles.heading}>
        <h1 className={styles.pageTitle}>{text.title}</h1>
        <label className={styles.search}>
          <span>{text.searchLabel}</span>
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={text.searchPlaceholder} />
        </label>
      </div>
      {loading && <p className={styles.state} aria-live="polite">{text.loading}</p>}
      {failed && <div className={styles.state}><h2>{text.errorTitle}</h2><p>{text.errorBody}</p></div>}
      {!loading && !failed && !hasProgramme && <p className={styles.state}>{text.empty}</p>}
      {!loading && !failed && hasProgramme && !hasResults && <p className={styles.state}>{text.noResults}</p>}
      {!loading && !failed && filteredCycles.map((cycle) => <CycleRow cycle={cycle} notice={showingPast ? text.pastEvents : undefined} key={cycle.id} />)}
      {!loading && !failed && filteredStandaloneEvents.length > 0 && <EventShelf title={text.standalone} events={filteredStandaloneEvents} notice={showingPast ? text.pastEvents : undefined} />}
    </main>
  </div>;
}
