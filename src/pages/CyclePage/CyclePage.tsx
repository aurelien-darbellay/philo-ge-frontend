import { Link, useNavigate, useParams } from "react-router-dom";
import { CycleRow } from "../../components/programme/CycleRow/CycleRow";
import { BrandMark } from "../../components/ui/BrandMark/BrandMark";
import { LanguageSelector } from "../../components/ui/LanguageSelector/LanguageSelector";
import { usePublicCycle } from "../../hooks/usePublicCycle";
import { useText } from "../../i18n/useText";
import { cyclePageText } from "./CyclePage.text";
import styles from "./CyclePage.module.css";

function cycleId(value: string | undefined): number | null {
  return value && /^[1-9][0-9]*$/.test(value) ? Number(value) : null;
}

export function CyclePage() {
  const text = useText(cyclePageText);
  const navigate = useNavigate();
  const params = useParams();
  const { cycle, loading, failed } = usePublicCycle(cycleId(params.cycleId));

  if (loading) return <main className={styles.state} aria-live="polite">{text.loading}</main>;

  if (failed || !cycle) {
    return <main className={styles.state}><h1>{text.notFoundTitle}</h1><p>{text.notFoundBody}</p><Link to="/programme">{text.programme}</Link></main>;
  }

  return <div className={styles.page}>
    <header className={styles.header}>
      <Link to="/" aria-label={text.brand}><BrandMark compact /></Link>
      <div className={styles.headerActions}><button type="button" onClick={() => navigate(-1)}>{text.back}</button><LanguageSelector /></div>
    </header>
    <main className={styles.main}>
      <section className={styles.introduction}>
        <div>
          <p className={styles.eyebrow}>{text.cycle}</p>
          <h1>{cycle.title}</h1>
          {cycle.status === "cancelled" && <p className={styles.cancelled}>{text.cancelled}</p>}
        </div>
        {cycle.description && <p className={styles.description}>{cycle.description}</p>}
      </section>
      <CycleRow cycle={cycle} showTitle={false} />
    </main>
  </div>;
}
