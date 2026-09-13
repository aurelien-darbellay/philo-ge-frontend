import { useEffect, useMemo, useState, type FormEvent } from "react";
import { api, ApiError } from "../../api";
import { useAuth } from "../../AuthContext";
import { Alert } from "../../components/ui/Alert/Alert";
import { Button } from "../../components/ui/Button/Button";
import { Card } from "../../components/ui/Card/Card";
import { PageHeader } from "../../components/ui/PageHeader/PageHeader";
import { TextField } from "../../components/ui/TextField/TextField";
import { useText } from "../../i18n/useText";
import { AppShell } from "../../layouts/AppShell/AppShell";
import { adminNewsletterPageText } from "./AdminNewsletterPage.text";
import styles from "./AdminNewsletterPage.module.css";

export function AdminNewsletterPage() {
  const text = useText(adminNewsletterPageText);
  const { csrfToken } = useAuth();
  const [emails, setEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api.newsletterEmails()
      .then(({ emails: value }) => {
        if (active) setEmails(value);
      })
      .catch(() => {
        if (active) setError(text.loadError);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [text.loadError]);

  const sortedEmails = useMemo(() => [...emails].sort((left, right) => left.localeCompare(right)), [emails]);

  const addEmail = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!csrfToken || adding || newEmail.trim() === "") return;

    setAdding(true);
    setError("");
    try {
      await api.adminAddNewsletterEmail(newEmail.trim(), csrfToken);
      const normalized = newEmail.trim().toLowerCase();
      setEmails((current) => current.includes(normalized) ? current : [...current, normalized]);
      setNewEmail("");
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : text.addError);
    } finally {
      setAdding(false);
    }
  };

  const removeEmail = async (email: string) => {
    if (!csrfToken || removing !== null) return;

    setRemoving(email);
    setError("");
    try {
      await api.adminDeleteNewsletterEmail(email, csrfToken);
      setEmails((current) => current.filter((value) => value !== email));
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : text.removeError);
    } finally {
      setRemoving(null);
    }
  };

  return <AppShell><main className={styles.page}>
    <PageHeader eyebrow={text.eyebrow} title={text.title} lead={text.lead} />
    <form className={styles.form} onSubmit={addEmail}>
      <TextField
        label={text.addLabel}
        type="email"
        autoComplete="email"
        placeholder={text.addPlaceholder}
        required
        maxLength={254}
        value={newEmail}
        onChange={(event) => setNewEmail(event.target.value)}
      />
      <Button type="submit" disabled={adding || newEmail.trim() === ""}>{adding ? text.adding : text.addButton}</Button>
    </form>
    {error && <Alert>{error}</Alert>}
    <Card className={styles.listCard}>
      {loading
        ? <p className={styles.state}>{text.loading}</p>
        : sortedEmails.length === 0
          ? <p className={styles.state}>{text.empty}</p>
          : <ul className={styles.list}>{sortedEmails.map((email) => <li className={styles.item} key={email}><strong>{email}</strong><Button variant="danger" disabled={removing === email} onClick={() => removeEmail(email)}>{removing === email ? text.removing : text.remove}</Button></li>)}</ul>}
    </Card>
  </main></AppShell>;
}
