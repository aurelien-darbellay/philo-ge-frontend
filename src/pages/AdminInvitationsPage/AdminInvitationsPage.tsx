import { useState, type FormEvent } from "react";
import { api, ApiError } from "../../api";
import { useAuth } from "../../AuthContext";
import { Alert } from "../../components/ui/Alert/Alert";
import { Button } from "../../components/ui/Button/Button";
import { Card } from "../../components/ui/Card/Card";
import { PageHeader } from "../../components/ui/PageHeader/PageHeader";
import { TextField } from "../../components/ui/TextField/TextField";
import { AppShell } from "../../layouts/AppShell/AppShell";
import type { Invitation } from "../../types";
import { adminInvitationsPageDefaultText as text } from "./AdminInvitationsPage.text";
import styles from "./AdminInvitationsPage.module.css";
function message(error: unknown) { if (error instanceof ApiError && error.code === "user_exists") return text.userExists; if (error instanceof ApiError && error.code === "invalid_email") return text.invalidEmail; return text.genericError; }
export function AdminInvitationsPage() { const { csrfToken } = useAuth(); const [email, setEmail] = useState(""); const [invitation, setInvitation] = useState<Invitation | null>(null); const [error, setError] = useState(""); const [copied, setCopied] = useState(false); const submit = async (event: FormEvent) => { event.preventDefault(); setError(""); setInvitation(null); setCopied(false); try { const result = await api.createInvitation(email, csrfToken!); setInvitation(result.invitation); setEmail(""); } catch (caught) { setError(message(caught)); } }; const copy = async () => { if (invitation?.url) { await navigator.clipboard.writeText(invitation.url); setCopied(true); } }; return <AppShell><main className={styles.page}><PageHeader eyebrow={text.eyebrow} title={text.title} lead={text.lead} /><Card><form className={styles.form} onSubmit={submit}><TextField label={text.email} type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder={text.placeholder} required /><Button>{text.create}</Button></form></Card>{error && <Alert>{error}</Alert>}{invitation?.url && <Card className={styles.result}><div><div className={styles.eyebrow}>{text.ready}</div><strong>{invitation.email}</strong></div><code className={styles.url}>{invitation.url}</code><Button variant="secondary" onClick={copy}>{copied ? text.copied : text.copy}</Button></Card>}</main></AppShell>; }
