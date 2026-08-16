import { useEffect, useState } from "react";
import { api } from "../../api";
import { Alert } from "../../components/ui/Alert/Alert";
import { Badge } from "../../components/ui/Badge/Badge";
import { ButtonLink } from "../../components/ui/Button/Button";
import { Card } from "../../components/ui/Card/Card";
import { PageHeader } from "../../components/ui/PageHeader/PageHeader";
import { useLanguage } from "../../i18n/LanguageContext";
import { languageLocales } from "../../i18n/textMap";
import { useText } from "../../i18n/useText";
import { AppShell } from "../../layouts/AppShell/AppShell";
import type { AdminUser } from "../../types";
import { adminUsersPageText } from "./AdminUsersPage.text";
import styles from "./AdminUsersPage.module.css";
export function AdminUsersPage() { const [users, setUsers] = useState<AdminUser[]>([]); const [error, setError] = useState(""); const [loading, setLoading] = useState(true); const { language } = useLanguage(); const text = useText(adminUsersPageText); useEffect(() => { api.users().then(({ users: value }) => setUsers(value)).catch(() => setError(text.genericError)).finally(() => setLoading(false)); }, [text.genericError]); const countLabel = users.length === 1 ? text.singularCount : text.pluralCount; return <AppShell><main className={styles.page}><div className={styles.headerRow}><div><PageHeader eyebrow={text.eyebrow} title={text.title} /><p className={styles.count}>{users.length} {countLabel}</p></div><ButtonLink to="/admin/invitations">{text.invite}</ButtonLink></div>{error && <Alert>{error}</Alert>}<Card className={styles.tableCard}>{loading ? <div className={styles.empty}>{text.loading}</div> : users.length === 0 ? <div className={styles.empty}>{text.empty}</div> : <table className={styles.table}><thead><tr><th>{text.username}</th><th>{text.email}</th><th>{text.role}</th><th>{text.status}</th><th>{text.joined}</th></tr></thead><tbody>{users.map((user) => <tr key={user.id}><td><strong>{user.username}</strong></td><td>{user.email}</td><td><Badge tone={user.role}>{user.role === "admin" ? text.admin : text.guest}</Badge></td><td>{user.blocked ? text.blocked : text.active}</td><td>{new Date(`${user.created_at}Z`).toLocaleDateString(languageLocales[language])}</td></tr>)}</tbody></table>}</Card></main></AppShell>; }
