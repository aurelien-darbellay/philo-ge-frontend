import { defaultText, defineTextMap } from "../../../i18n/textMap";

export const landingFooterText = defineTextMap({
  fr: { contact: "Contact", memberSpace: "Espace membre", instagram: "Instagram", legal: "Mentions légales", city: "Genève · Suisse", copyright: "© 2026 Philo Genève", archiveLabel: "Archives" },
  de: { contact: "Kontakt", memberSpace: "Mitgliederbereich", instagram: "Instagram", legal: "Impressum", city: "Genf · Schweiz", copyright: "© 2026 Philo Genf", archiveLabel: "Archiv" },
  it: { contact: "Contatto", memberSpace: "Area membri", instagram: "Instagram", legal: "Note legali", city: "Ginevra · Svizzera", copyright: "© 2026 Philo Ginevra", archiveLabel: "Archivio" },
  en: { contact: "Contact", memberSpace: "Member space", instagram: "Instagram", legal: "Legal notice", city: "Geneva · Switzerland", copyright: "© 2026 Philo Geneva", archiveLabel: "Archive" },
});

export const landingFooterDefaultText = defaultText(landingFooterText);
