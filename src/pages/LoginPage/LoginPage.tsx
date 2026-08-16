import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ApiError } from "../../api";
import { useAuth } from "../../AuthContext";
import { Alert } from "../../components/ui/Alert/Alert";
import { BrandMark } from "../../components/ui/BrandMark/BrandMark";
import { Button } from "../../components/ui/Button/Button";
import { Card } from "../../components/ui/Card/Card";
import { Checkbox } from "../../components/ui/Checkbox/Checkbox";
import { LoadingIndicator } from "../../components/ui/LoadingIndicator/LoadingIndicator";
import { TextField } from "../../components/ui/TextField/TextField";
import { loginPageDefaultText as text } from "./LoginPage.text";
import styles from "./LoginPage.module.css";

function message(error: unknown): string {
  if (error instanceof ApiError && error.code === "invalid_credentials") return text.invalidCredentials;
  if (error instanceof ApiError && error.code === "too_many_attempts") return text.tooManyAttempts;
  return text.genericError;
}

export function LoginPage() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <LoadingIndicator />;
  if (user) return <Navigate to="/espace-membre" replace />;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password, rememberMe);
      navigate("/espace-membre");
    } catch (caught) {
      setError(message(caught));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className={styles.layout}>
      <section className={styles.intro}>
        <div className={styles.eyebrow}>{text.eyebrow}</div>
        <h1 className={styles.heroTitle}>{text.heroTitle}</h1>
        <p>{text.heroBody}</p>
      </section>
      <section className={styles.panel}>
        <Card className={styles.card}>
          <form className={styles.form} onSubmit={submit}>
            <BrandMark />
            <div>
              <h1>{text.title}</h1>
              <p className={styles.subtitle}>{text.subtitle}</p>
            </div>
            {error && <Alert>{error}</Alert>}
            <TextField label={text.email} type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            <TextField label={text.password} type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            <Checkbox label={text.remember} checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} />
            <Button disabled={submitting}>{submitting ? text.submitting : text.submit}</Button>
            <p className={styles.hint}>{text.invitationOnly}</p>
          </form>
        </Card>
      </section>
    </main>
  );
}
