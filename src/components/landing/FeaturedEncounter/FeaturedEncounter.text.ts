import { defaultText, defineTextMap } from "../../../i18n/textMap";

export const featuredEncounterText = defineTextMap({
  fr: {
    sectionLabel: "À la une",
    cycle: "Cycle",
    event: "Rencontre",
    events: "rencontres",
    online: "En ligne",
    action: "En savoir plus",
  },
  de: {
    sectionLabel: "Im Fokus",
    cycle: "Zyklus",
    event: "Veranstaltung",
    events: "Veranstaltungen",
    online: "Online",
    action: "Mehr erfahren",
  },
  it: {
    sectionLabel: "In evidenza",
    cycle: "Ciclo",
    event: "Incontro",
    events: "incontri",
    online: "Online",
    action: "Scopri di più",
  },
  en: {
    sectionLabel: "Featured",
    cycle: "Cycle",
    event: "Event",
    events: "events",
    online: "Online",
    action: "Learn more",
  },
});

export const featuredEncounterDefaultText = defaultText(featuredEncounterText);
