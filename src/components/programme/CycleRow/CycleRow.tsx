import { apiAssetUrl } from "../../../api";
import { Link } from "react-router-dom";
import { useLanguage } from "../../../i18n/LanguageContext";
import { languageLocales } from "../../../i18n/textMap";
import { useText } from "../../../i18n/useText";
import type { PublicCycle } from "../../../types";
import { EventShelf } from "../EventShelf/EventShelf";
import { cycleRowText } from "./CycleRow.text";
import styles from "./CycleRow.module.css";

export function CycleRow({ cycle, showTitle = true, notice }: { cycle: PublicCycle; showTitle?: boolean; notice?: string }) {
  const text = useText(cycleRowText);
  const { language } = useLanguage();
  const formatter = new Intl.DateTimeFormat(languageLocales[language], { day: "numeric", month: "long", year: "numeric" });
  const dates = [cycle.starts_on, cycle.ends_on]
    .filter((value): value is string => value !== null)
    .map((value) => formatter.format(new Date(`${value}T00:00:00Z`)))
    .join(" – ");
  const titleClass = cycle.title.length > 120
    ? styles.titleDense
    : cycle.title.length > 80
      ? styles.titleCompact
      : "";

  const lead = <Link className={styles.leadLink} to={`/cycles/${cycle.id}`}><article className={styles.lead}>
    {cycle.image_path ? <div className={styles.image}><img src={apiAssetUrl(cycle.image_path)} alt="" /></div> : <div className={styles.artwork}>
      <span className={styles.label}>{text.cycle}</span>
      <strong className={titleClass}>{cycle.title}</strong>
      <span className={styles.dates}>{dates}</span>
      <i /><i />
    </div>}
  </article></Link>;

  return <EventShelf title={cycle.title} titleTo={`/cycles/${cycle.id}`} dates={dates} events={cycle.events} lead={lead} pageSize={4} showTitle={showTitle} notice={notice} />;
}
