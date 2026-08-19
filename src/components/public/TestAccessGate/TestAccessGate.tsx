import { useState, type FormEvent } from "react";
import { useText } from "../../../i18n/useText";
import { Button } from "../../ui/Button/Button";
import { BrandMark } from "../../ui/BrandMark/BrandMark";
import { LanguageSelector } from "../../ui/LanguageSelector/LanguageSelector";
import { TextField } from "../../ui/TextField/TextField";
import { testAccessGateText } from "./TestAccessGate.text";
import styles from "./TestAccessGate.module.css";

const COOKIE_NAME = "philo_ge_test_access";
const TEST_PASSWORD = "philo-ge-test";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

function hasAccessCookie(): boolean {
  return document.cookie.split("; ").some((cookie) => cookie === `${COOKIE_NAME}=granted`);
}

export function TestAccessGate() {
  const text = useText(testAccessGateText);
  const [visible, setVisible] = useState(() => !hasAccessCookie());
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  if (!visible) return null;

  const submit = (event: FormEvent) => {
    event.preventDefault();

    if (password !== TEST_PASSWORD) {
      setError(true);
      return;
    }

    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${COOKIE_NAME}=granted; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
    setVisible(false);
  };

  return <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="test-access-title">
    <section className={styles.banner}>
      <div className={styles.header}><BrandMark compact /><LanguageSelector /></div>
      <p className={styles.eyebrow}>{text.eyebrow}</p>
      <h1 id="test-access-title">{text.title}</h1>
      <p className={styles.body}>{text.body}</p>
      <form className={styles.form} onSubmit={submit}>
        <TextField label={text.password} type="password" value={password} autoComplete="current-password" autoFocus aria-invalid={error} onChange={(event) => { setPassword(event.target.value); setError(false); }} required />
        {error && <p className={styles.error} role="alert">{text.error}</p>}
        <Button>{text.submit}</Button>
      </form>
    </section>
  </div>;
}
