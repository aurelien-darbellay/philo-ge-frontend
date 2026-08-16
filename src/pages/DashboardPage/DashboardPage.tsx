import { useAuth } from "../../AuthContext";
import { PageHeader } from "../../components/ui/PageHeader/PageHeader";
import { AppShell } from "../../layouts/AppShell/AppShell";
import { dashboardPageDefaultText as text } from "./DashboardPage.text";
import styles from "./DashboardPage.module.css";
export function DashboardPage() { const { user } = useAuth(); const features = [{ number: text.featureOneNumber, title: text.conversations, body: text.conversationsBody }, { number: text.featureTwoNumber, title: text.events, body: text.eventsBody }, { number: text.featureThreeNumber, title: text.archives, body: text.archivesBody }]; return <AppShell><main className={styles.page}><PageHeader eyebrow={text.eyebrow} title={text.title} /><p className={styles.signedIn}>{text.signedIn} <strong>{user?.email}</strong>{text.signedInSuffix}</p><div className={styles.grid}>{features.map((feature) => <article className={styles.feature} key={feature.number}><span className={styles.number}>{feature.number}</span><h2>{feature.title}</h2><p>{feature.body}</p></article>)}</div></main></AppShell>; }
