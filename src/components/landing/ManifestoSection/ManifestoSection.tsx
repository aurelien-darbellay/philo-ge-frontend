import { useEffect, useState } from "react";
import { api } from "../../../api";
import type { AboutContent } from "../../../types";
import { useLanguage } from "../../../i18n/LanguageContext";
import { useText } from "../../../i18n/useText";
import { MarkdownContent } from "../../ui/MarkdownContent/MarkdownContent";
import { manifestoSectionText } from "./ManifestoSection.text";
import styles from "./ManifestoSection.module.css";

export function ManifestoSection() {
  const text = useText(manifestoSectionText);
  const { language } = useLanguage();
  const [content, setContent] = useState<AboutContent | null>(null);

  useEffect(() => {
    let active = true;
    void api.aboutContent()
      .then(({ content: nextContent }) => {
        if (active) setContent(nextContent);
      })
      .catch(() => {
        if (active) setContent(null);
      });

    return () => {
      active = false;
    };
  }, []);

  const localizedContent = content
    ? {
      fr: { title: content.title_fr, body: content.body_fr },
      de: { title: content.title_de, body: content.body_de },
      it: { title: content.title_it, body: content.body_it },
      en: { title: content.title_en, body: content.body_en },
    }[language]
    : { title: text.title, body: text.body };

  return (
    <section className={styles.section} id="association" aria-labelledby="manifesto-title">
      <div className={styles.inner}>
        <p className={styles.eyebrow}>{text.eyebrow}</p>
        <h2 id="manifesto-title">{localizedContent.title}</h2>
        <div className={styles.copy}>
          <MarkdownContent value={localizedContent.body} />
          <a className={styles.action} href="https://www.unige.ch/lettres/philo/varia/groupe-genevois-de-philosophie">{text.action}<span aria-hidden="true">→</span></a>
        </div>
        <div className={styles.mark} aria-hidden="true"><span /><span /><span /></div>
      </div>
    </section>
  );
}
