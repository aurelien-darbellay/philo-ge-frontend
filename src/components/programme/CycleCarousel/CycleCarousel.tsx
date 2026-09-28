import { useEffect, useId, useState } from "react";
import { Link } from "react-router-dom";
import { apiAssetUrl } from "../../../api";
import { useText } from "../../../i18n/useText";
import type { PublicCycle } from "../../../types";
import { MarkdownContent } from "../../ui/MarkdownContent/MarkdownContent";
import { CyclePartners } from "../CyclePartners/CyclePartners";
import { cycleCarouselText } from "./CycleCarousel.text";
import styles from "./CycleCarousel.module.css";

function yearRange(cycle: PublicCycle): string {
  const start = cycle.starts_on?.slice(0, 4);
  const end = cycle.ends_on?.slice(0, 4);
  if (start && end) return start === end ? start : `${start}–${end}`;
  return start ?? end ?? "";
}

export function CycleCarousel({ cycles, today }: { cycles: PublicCycle[]; today: string }) {
  const text = useText(cycleCarouselText);
  const headingId = useId();
  const [index, setIndex] = useState(0);

  useEffect(() => setIndex(0), [cycles]);
  if (cycles.length === 0) return null;

  const cycle = cycles[Math.min(index, cycles.length - 1)];
  const isCurrent = (!cycle.starts_on || cycle.starts_on <= today) && (!cycle.ends_on || cycle.ends_on >= today);

  return <section className={styles.section} aria-labelledby={headingId}>
    <div className={styles.heading}>
      <div className={styles.controls}>
        <span className={styles.controlsLabel}>{text.cycles}</span>
        <span className={`${styles.status} ${isCurrent ? styles.current : styles.upcoming}`} aria-live="polite">
          {isCurrent ? text.current : text.upcoming}
        </span>
        <button type="button" aria-label={text.previous} disabled={index === 0} onClick={() => setIndex((value) => value - 1)}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
        </button>
        <button type="button" aria-label={text.next} disabled={index === cycles.length - 1} onClick={() => setIndex((value) => value + 1)}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
        </button>
      </div>
      <h2 id={headingId}>{cycle.title}</h2>
      {yearRange(cycle) && <p className={styles.years}>{yearRange(cycle)}</p>}
    </div>
    <article className={styles.slide}>
      <div className={styles.visual}>
        {cycle.image_path
          ? <img src={apiAssetUrl(cycle.image_path)} alt="" />
          : <div className={styles.artwork} aria-hidden="true"><span>{text.cycle}</span><i /><i /></div>}
      </div>
      <div className={styles.content}>
        {cycle.description && <MarkdownContent value={cycle.description} />}
        <Link className={styles.link} to={`/cycles/${cycle.id}`}>{text.details}<span aria-hidden="true"> →</span></Link>
        <CyclePartners partners={cycle.partners} />
      </div>
    </article>
  </section>;
}
