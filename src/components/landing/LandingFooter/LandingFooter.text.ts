import { defaultText, defineTextMap } from "../../../i18n/textMap";

export const landingFooterText = defineTextMap({
  fr: { contact: "Contact", memberSpace: "Espace membre", support: "Nous soutenir", facebook: "Facebook", instagram: "Instagram", city: "Genève · Suisse", copyright: "© 2026 Philo Genève", archiveLabel: "Archives", podcasts: "Podcasts" },
  de: { contact: "Kontakt", memberSpace: "Mitgliederbereich", support: "Uns unterstützen", facebook: "Facebook", instagram: "Instagram", city: "Genf · Schweiz", copyright: "© 2026 Philo Genf", archiveLabel: "Archiv", podcasts: "Podcasts" },
  it: { contact: "Contatto", memberSpace: "Area membri", support: "Sostienici", facebook: "Facebook", instagram: "Instagram", city: "Ginevra · Svizzera", copyright: "© 2026 Philo Ginevra", archiveLabel: "Archivio", podcasts: "Podcast" },
  en: { contact: "Contact", memberSpace: "Member space", support: "Support us", facebook: "Facebook", instagram: "Instagram", city: "Geneva · Switzerland", copyright: "© 2026 Philo Geneva", archiveLabel: "Archive", podcasts: "Podcasts" },
});

export const landingFooterDefaultText = defaultText(landingFooterText);
