import { defaultText, defineTextMap } from "../../../i18n/textMap";

export const featuredEncounterText = defineTextMap({
  fr: {
    sectionLabel: "À la une",
    format: "Conversation publique",
    date: "24 septembre 2026 · 19h00",
    title: "Que peut encore la philosophie ?",
    description: "Une soirée pour interroger la place de la pensée critique quand l’urgence semble imposer ses réponses et son rythme.",
    participants: "Avec des philosophes, chercheur·euses et voix de la cité",
    location: "Genève · Lieu annoncé prochainement",
    action: "En savoir plus",
  },
  de: {
    sectionLabel: "Im Fokus",
    format: "Öffentliches Gespräch",
    date: "24. September 2026 · 19:00 Uhr",
    title: "Was kann Philosophie noch bewirken?",
    description: "Ein Abend über den Platz des kritischen Denkens, wenn die Dringlichkeit ihre Antworten und ihr Tempo vorzugeben scheint.",
    participants: "Mit Philosoph:innen, Forschenden und Stimmen aus der Stadt",
    location: "Genf · Ort wird demnächst bekannt gegeben",
    action: "Mehr erfahren",
  },
  it: {
    sectionLabel: "In evidenza",
    format: "Conversazione pubblica",
    date: "24 settembre 2026 · 19:00",
    title: "Che cosa può ancora la filosofia?",
    description: "Una serata per interrogare il ruolo del pensiero critico quando l'urgenza sembra imporre risposte e ritmo.",
    participants: "Con filosofe e filosofi, ricercatori e voci della città",
    location: "Ginevra · Luogo annunciato prossimamente",
    action: "Scopri di più",
  },
  en: {
    sectionLabel: "Featured",
    format: "Public conversation",
    date: "24 September 2026 · 7 pm",
    title: "What can philosophy still do?",
    description: "An evening questioning the place of critical thought when urgency appears to impose its answers and its pace.",
    participants: "With philosophers, researchers, and voices from the city",
    location: "Geneva · Venue announced shortly",
    action: "Learn more",
  },
});

export const featuredEncounterDefaultText = defaultText(featuredEncounterText);
