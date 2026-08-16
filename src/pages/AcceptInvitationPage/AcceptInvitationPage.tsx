import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api, ApiError } from "../../api";
import { useAuth } from "../../AuthContext";
import { Alert } from "../../components/ui/Alert/Alert";
import { BrandMark } from "../../components/ui/BrandMark/BrandMark";
import { Button } from "../../components/ui/Button/Button";
import { Card } from "../../components/ui/Card/Card";
import { Checkbox } from "../../components/ui/Checkbox/Checkbox";
import { LoadingIndicator } from "../../components/ui/LoadingIndicator/LoadingIndicator";
import { TextField } from "../../components/ui/TextField/TextField";
import { useText } from "../../i18n/useText";
import type { Invitation } from "../../types";
import { acceptInvitationPageText } from "./AcceptInvitationPage.text";
import styles from "./AcceptInvitationPage.module.css";

export function AcceptInvitationPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { acceptInvitation } = useAuth();
  const text = useText(acceptInvitationPageText);
  const token = params.get("token") ?? "";
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const message = (caught: unknown): string => {
    if (caught instanceof ApiError && caught.code === "invalid_invitation") return text.invalidInvitation;
    if (caught instanceof ApiError && caught.code === "invalid_username") return text.invalidUsername;
    if (caught instanceof ApiError && caught.code === "username_exists") return text.usernameExists;
    if (caught instanceof ApiError && caught.code === "password_mismatch") return text.passwordMismatch;
    if (caught instanceof ApiError && caught.code === "invalid_password") return text.invalidPassword;
    return text.genericError;
  };

  useEffect(() => {
    api.inspectInvitation(token)
      .then(({ invitation: value }) => setInvitation(value))
      .catch((caught) => setError(message(caught)))
      .finally(() => setLoading(false));
  }, [token, text]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await acceptInvitation(token, username, password, confirmation, rememberMe);
      navigate("/espace-membre");
    } catch (caught) {
      setError(message(caught));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingIndicator />;

  return (
    <main className={styles.page}>
      <Card className={styles.card}>
        <BrandMark />
        <div className={styles.eyebrow}>{text.eyebrow}</div>
        <h1>{text.title}</h1>
        {error && <Alert>{error}</Alert>}
        {invitation && (
          <form className={styles.fields} onSubmit={submit}>
            <p className={styles.description}>
              {text.invitationFor} <strong>{invitation.email}</strong>
              {text.invitationSeparator}{text.choosePassword}
            </p>
            <TextField label={text.username} hint={text.usernameHint} type="text" minLength={3} maxLength={50} pattern="[a-zA-Z0-9._-]+" autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} required />
            <TextField label={text.password} hint={text.passwordHint} type="password" minLength={12} maxLength={1024} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            <TextField label={text.confirmation} type="password" minLength={12} maxLength={1024} autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required />
            <Checkbox label={text.remember} checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} />
            <Button disabled={submitting}>{submitting ? text.submitting : text.submit}</Button>
          </form>
        )}
      </Card>
    </main>
  );
}
