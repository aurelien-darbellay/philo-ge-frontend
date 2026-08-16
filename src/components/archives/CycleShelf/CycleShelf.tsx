import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiAssetUrl } from "../../../api";
import { useLanguage } from "../../../i18n/LanguageContext";
import { languageLocales } from "../../../i18n/textMap";
import { useText } from "../../../i18n/useText";
import type { PublicCycle } from "../../../types";
import { cycleShelfText } from "./CycleShelf.text";
import styles from "./CycleShelf.module.css";

const pageSize = 5;

export function CycleShelf({ title, cycles }: { title: string; cycles: PublicCycle[] }) {
  const text = useText(cycleShelfText);
  const { language } = useLanguage();
  const [page, setPage] = useState(0);
  const pageCount = Math.ceil(cycles.length / pageSize);
  const visibleCycles = cycles.slice(page * pageSize, (page + 1) * pageSize);
  const dateFormatter = new Intl.DateTimeFormat(languageLocales[language], { day: "numeric", month: "long", year: "numeric" });

  useEffect(() => setPage(0), [cycles]);

  const formatDates = (cycle: PublicCycle) => [cycle.starts_on, cycle.ends_on]
    .filter((date): date is string => date !== null)
    .map((date) => dateFormatter.format(new Date(`${date}T00:00:00Z`)))
    .join(" – ");

  return <section className={styles.shelf}>
    <header className={styles.heading}>
      <h2>{title}</h2>
      {pageCount > 1 && <nav className={styles.controls} aria-label={title}>
        <button type="button" aria-label={text.previous} disabled={page === 0} onClick={() => setPage((value) => value - 1)}>&lt;</button>
        <button type="button" aria-label={text.next} disabled={page >= pageCount - 1} onClick={() => setPage((value) => value + 1)}>&gt;</button>
      </nav>}
    </header>
    <div className={styles.cycles}>
      {visibleCycles.map((cycle) => <Link className={styles.cycle} to={`/cycles/${cycle.id}`} key={cycle.id}>
        {cycle.image_path
          ? <div className={styles.image}><img src={apiAssetUrl(cycle.image_path)} alt="" /></div>
          : <div className={styles.artwork} aria-hidden="true"><span>{text.cycle}</span><i /><i /></div>}
        <h3>{cycle.title}</h3>
        {(cycle.starts_on || cycle.ends_on) && <p>{formatDates(cycle)}</p>}
      </Link>)}
    </div>
  </section>;
}
