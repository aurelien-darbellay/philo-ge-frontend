import { useEffect, useMemo, useState } from "react";
import { api } from "../../api";
import { useAuth } from "../../AuthContext";
import { Alert } from "../../components/ui/Alert/Alert";
import { Button, ButtonLink } from "../../components/ui/Button/Button";
import { Card } from "../../components/ui/Card/Card";
import { PageHeader } from "../../components/ui/PageHeader/PageHeader";
import { TextField } from "../../components/ui/TextField/TextField";
import { useLanguage } from "../../i18n/LanguageContext";
import { languageLocales } from "../../i18n/textMap";
import { useText } from "../../i18n/useText";
import { AppShell } from "../../layouts/AppShell/AppShell";
import type { AdminUser, Role } from "../../types";
import { normalizeSearchValue } from "../../utils/normalizeSearchValue";
import { adminUsersPageText } from "./AdminUsersPage.text";
import styles from "./AdminUsersPage.module.css";

export function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [pendingUserId, setPendingUserId] = useState<number | null>(null);
  const [pendingRoleUserId, setPendingRoleUserId] = useState<number | null>(null);
  const { user: currentUser, csrfToken } = useAuth();
  const { language } = useLanguage();
  const text = useText(adminUsersPageText);

  useEffect(() => {
    api.users()
      .then(({ users: value }) => setUsers(value))
      .catch(() => setError(text.genericError))
      .finally(() => setLoading(false));
  }, [text.genericError]);

  const normalizedQuery = normalizeSearchValue(query.trim());
  const filteredUsers = useMemo(() => users.filter((user) =>
    normalizedQuery.length === 0 || [user.username, user.email]
      .some((value) => normalizeSearchValue(value).includes(normalizedQuery)),
  ), [normalizedQuery, users]);

  const toggleBlocked = async (user: AdminUser) => {
    if (!csrfToken || user.id === currentUser?.id) return;
    setPendingUserId(user.id);
    setError("");

    try {
      const { user: updated } = await api.setUserBlocked(user.id, !user.blocked, csrfToken);
      setUsers((current) => current.map((item) => item.id === updated.id ? updated : item));
    } catch {
      setError(text.blockError);
    } finally {
      setPendingUserId(null);
    }
  };

  const changeRole = async (user: AdminUser, role: Role) => {
    if (!csrfToken || user.id === currentUser?.id || role === user.role) return;
    setPendingRoleUserId(user.id);
    setError("");

    try {
      const { user: updated } = await api.setUserRole(user.id, role, csrfToken);
      setUsers((current) => current.map((item) => item.id === updated.id ? updated : item));
    } catch {
      setError(text.roleError);
    } finally {
      setPendingRoleUserId(null);
    }
  };

  const countLabel = users.length === 1 ? text.singularCount : text.pluralCount;

  return <AppShell><main className={styles.page}>
    <div className={styles.headerRow}><div><PageHeader eyebrow={text.eyebrow} title={text.title} /><p className={styles.count}>{users.length} {countLabel}</p></div><ButtonLink to="/admin/invitations">{text.invite}</ButtonLink></div>
    <div className={styles.search}><TextField label={text.search} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={text.searchPlaceholder} /></div>
    {error && <Alert>{error}</Alert>}
    <Card className={styles.tableCard}>{loading ? <div className={styles.empty}>{text.loading}</div> : users.length === 0 ? <div className={styles.empty}>{text.empty}</div> : filteredUsers.length === 0 ? <div className={styles.empty}>{text.noResults}</div> : <table className={styles.table}>
      <thead><tr><th>{text.username}</th><th>{text.email}</th><th>{text.role}</th><th>{text.status}</th><th>{text.joined}</th><th>{text.actions}</th></tr></thead>
      <tbody>{filteredUsers.map((user) => {
        const ownAccount = user.id === currentUser?.id;
        return <tr key={user.id}><td><strong>{user.username}</strong></td><td>{user.email}</td><td><select className={styles.roleSelect} value={user.role} aria-label={text.roleFor.replace("{username}", user.username)} disabled={pendingRoleUserId === user.id || ownAccount} title={ownAccount ? text.ownAccount : undefined} onChange={(event) => changeRole(user, event.target.value as Role)}><option value="admin">{text.admin}</option><option value="guest">{text.guest}</option></select></td><td>{user.blocked ? text.blocked : text.active}</td><td>{new Date(`${user.created_at}Z`).toLocaleDateString(languageLocales[language])}</td><td><Button className={styles.toggle} variant={user.blocked ? "secondary" : "danger"} aria-pressed={user.blocked} disabled={pendingUserId === user.id || ownAccount} title={ownAccount ? text.ownAccount : undefined} onClick={() => toggleBlocked(user)}>{pendingUserId === user.id ? text.updating : user.blocked ? text.unblock : text.block}</Button></td></tr>;
      })}</tbody>
    </table>}</Card>
  </main></AppShell>;
}
