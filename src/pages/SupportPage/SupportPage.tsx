import { useEffect, useState, type FormEvent } from "react";
import { api, ApiError } from "../../api";
import paymentQr from "../../assets/QRCode.png";
import academyLogo from "../../assets/SAHSS_Logo.jpg";
import { PublicHeader } from "../../components/public/PublicHeader/PublicHeader";
import { Button } from "../../components/ui/Button/Button";
import { TextField } from "../../components/ui/TextField/TextField";
import { useLanguage } from "../../i18n/LanguageContext";
import { languageLocales } from "../../i18n/textMap";
import { useText } from "../../i18n/useText";
import type { BecomeMemberContent, CommitteeRole } from "../../types";
import { supportPageText } from "./SupportPage.text";
import styles from "./SupportPage.module.css";

export function SupportPage() {
  const text = useText(supportPageText);
  const { language } = useLanguage();
  const [committeeMembers, setCommitteeMembers] = useState<{ id: number; full_name: string; role: CommitteeRole }[]>([]);
  const [committeeLoading, setCommitteeLoading] = useState(true);
  const [committeeFailed, setCommitteeFailed] = useState(false);
  const [becomeMemberContent, setBecomeMemberContent] = useState<BecomeMemberContent | null>(null);
  const [email, setEmail] = useState("");
  const [subscriptionState, setSubscriptionState] = useState<"idle" | "submitting" | "success" | "error" | "invalid">("idle");

  useEffect(() => {
    let active = true;
    void api.committeeMembers()
      .then((response) => {
        if (!active) return;
        setCommitteeMembers(response.members);
        setCommitteeFailed(false);
      })
      .catch(() => {
        if (!active) return;
        setCommitteeMembers([]);
        setCommitteeFailed(true);
      })
      .finally(() => {
        if (active) setCommitteeLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    void api.becomeMemberContent()
      .then((response) => {
        if (!active) return;
        setBecomeMemberContent(response.content);
      })
      .catch(() => {
        if (!active) return;
        setBecomeMemberContent(null);
      });

    return () => {
      active = false;
    };
  }, []);

  const roleLabel = (role: CommitteeRole) => {
    switch (role) {
      case "treasurer":
        return text.treasurer;
      case "secretary":
        return text.secretary;
      case "president":
        return text.president;
      default:
        return text.member;
    }
  };

  const shouldShowRole = (role: CommitteeRole) => role !== "member";
  const membershipIntroByLanguage = becomeMemberContent
    ? {
      fr: becomeMemberContent.intro_fr,
      de: becomeMemberContent.intro_de,
      it: becomeMemberContent.intro_it,
      en: becomeMemberContent.intro_en,
    }
    : null;
  const quotaFormatter = new Intl.NumberFormat(languageLocales[language], {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  const regularQuotaLabel = becomeMemberContent ? `${quotaFormatter.format(becomeMemberContent.reg_quota)} CHF` : text.standardAmount;
  const reducedQuotaLabel = becomeMemberContent ? `${quotaFormatter.format(becomeMemberContent.reduce_quota)} CHF` : text.reducedAmount;

  const submitting = subscriptionState === "submitting";
  const subscribe = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    setSubscriptionState("submitting");
    try {
      await api.subscribeNewsletter(email.trim());
      setEmail("");
      setSubscriptionState("success");
    } catch (error) {
      setSubscriptionState(error instanceof ApiError && error.status === 422 ? "invalid" : "error");
    }
  };
  return <div className={styles.page}>
    <a className={styles.skipLink} href="#support-main">{text.skip}</a>
    <PublicHeader />
    <main id="support-main" className={styles.main}>
      <div className={styles.introduction}>
        <h1>{text.title}</h1>
        <p>{text.intro}</p>
      </div>
      <section className={styles.section} aria-labelledby="support-committee">
        <div className={styles.sectionHeading}><h2 id="support-committee">{text.committee}</h2><p>{text.committeeIntro}</p></div>
        {committeeLoading
          ? <p>{text.committeeLoading}</p>
          : committeeFailed
            ? <p>{text.committeeError}</p>
            : <ul className={styles.members}>{committeeMembers.map(member => <li key={member.id}><span>{member.full_name}</span>{shouldShowRole(member.role) && <>, <span className={styles.role}>{roleLabel(member.role)}</span></>}</li>)}</ul>}
      </section>
      <section className={styles.section} aria-labelledby="support-membership">
        <div className={styles.sectionHeading}><h2 id="support-membership">{text.membership}</h2><p>{membershipIntroByLanguage?.[language] ?? text.funding}</p></div>
        <div className={styles.membership}>
          <div className={styles.payment}>
            <p>{text.payment}</p>
            <h3>{text.fees}</h3>
            <dl className={styles.fees}><div><dt>{text.standard}</dt><dd>{regularQuotaLabel}</dd></div><div><dt>{text.reduced}</dt><dd>{reducedQuotaLabel}</dd></div></dl>
            <p className={styles.accountLabel}>{text.account}</p><p className={styles.iban}>{text.iban}</p>
            <p>{text.instructions}</p>
          </div>
          <figure className={styles.qr}>
            <div className={styles.qrMat}><img src={paymentQr} alt={text.qrAlt} /></div>
            <figcaption>{text.qrCaption}</figcaption>
            <a href={paymentQr} download="GGPh-QR-paiement.png">{text.download}<span aria-hidden="true"> ↓</span></a>
          </figure>
        </div>
      </section>
      <section className={`${styles.section} ${styles.newsletter}`} aria-labelledby="support-newsletter">
        <div className={styles.sectionHeading}><h2 id="support-newsletter">{text.newsletter}</h2><p>{text.newsletterIntro}</p></div>
        <form onSubmit={subscribe} aria-busy={submitting}>
          <div className={styles.signup}>
            <TextField label={text.email} type="email" autoComplete="email" name="email" required maxLength={254} value={email} disabled={submitting} aria-invalid={subscriptionState === "invalid"} aria-describedby="newsletter-feedback" onChange={(event) => { setEmail(event.target.value); setSubscriptionState("idle"); }} />
            <Button type="submit" disabled={submitting}>{submitting ? text.subscribing : text.subscribe}</Button>
          </div>
          <p id="newsletter-feedback" className={styles.notice} role="status" aria-live="polite">
            {subscriptionState === "success" ? text.subscribeSuccess : subscriptionState === "error" ? text.subscribeError : subscriptionState === "invalid" ? text.invalidEmail : ""}
          </p>
        </form>
      </section>
      <section className={styles.section} aria-labelledby="support-institution">
        <div className={styles.sectionHeading}><h2 id="support-institution">{text.institution}</h2></div>
        <img className={styles.academy} src={academyLogo} alt={text.academyAlt} />
      </section>
    </main>
  </div>;
}
