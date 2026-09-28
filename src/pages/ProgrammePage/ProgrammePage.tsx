import { useMemo, useState } from "react";
import { CycleCarousel } from "../../components/programme/CycleCarousel/CycleCarousel";
import { MobileCycleDialog } from "../../components/programme/MobileCycleDialog/MobileCycleDialog";
import { ProgrammeEventList } from "../../components/programme/ProgrammeEventList/ProgrammeEventList";
import { PublicHeader } from "../../components/public/PublicHeader/PublicHeader";
import { useProgramme } from "../../hooks/useProgramme";
import { useText } from "../../i18n/useText";
import { normalizeSearchValue } from "../../utils/normalizeSearchValue";
import { programmePageText } from "./ProgrammePage.text";
import styles from "./ProgrammePage.module.css";

export function ProgrammePage() {
  const text = useText(programmePageText);
  const { cycles, events, today, loading, failed } = useProgramme();
  const [query, setQuery] = useState("");

  const normalizedQuery = normalizeSearchValue(query.trim());
  const displayedCycles = useMemo(() => cycles
    .filter((cycle) => (cycle.starts_on !== null || cycle.ends_on !== null) && (!cycle.ends_on || cycle.ends_on >= today))
    .sort((left, right) => {
      const leftCurrent = (!left.starts_on || left.starts_on <= today) && (!left.ends_on || left.ends_on >= today);
      const rightCurrent = (!right.starts_on || right.starts_on <= today) && (!right.ends_on || right.ends_on >= today);
      if (leftCurrent !== rightCurrent) return leftCurrent ? -1 : 1;
      return (left.starts_on ?? left.ends_on ?? "").localeCompare(right.starts_on ?? right.ends_on ?? "");
    }), [cycles, today]);
  const filteredEvents = useMemo(() => events.filter((event) => {
    if (normalizedQuery.length === 0) return true;
    return [event.title, ...event.speakers.map((speaker) => speaker.name), event.venue.name, event.venue.address, event.cycle?.title]
      .filter((value): value is string => value !== null && value !== undefined)
      .some((value) => normalizeSearchValue(value).includes(normalizedQuery));
  }), [events, normalizedQuery]);
  const hasProgramme = cycles.length > 0 || events.length > 0;

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
      {!loading && !failed && hasProgramme && <div className={styles.programmeGrid}>
        <div className={styles.cycleColumn}><CycleCarousel cycles={displayedCycles} today={today} /></div>
        <div className={styles.mobileCycles}><MobileCycleDialog cycles={displayedCycles} today={today} /></div>
        <div className={styles.eventsColumn}><ProgrammeEventList events={filteredEvents} /></div>
      </div>}
    </main>
  </div>;
}
