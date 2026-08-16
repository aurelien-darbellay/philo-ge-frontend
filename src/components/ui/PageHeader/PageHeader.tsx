import styles from "./PageHeader.module.css";
export function PageHeader({ eyebrow, title, lead }: { eyebrow: string; title: string; lead?: string }) { return <header><div className={styles.eyebrow}>{eyebrow}</div><h1 className={styles.title}>{title}</h1>{lead && <p className={styles.lead}>{lead}</p>}</header>; }
