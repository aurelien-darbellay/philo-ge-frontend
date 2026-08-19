import { defaultText, defineTextMap } from "../../i18n/textMap";

export const landingPageText = defineTextMap({
  fr: {
    skipToContent: "Aller au contenu",
    eyebrow: "Association de philosophie · Genève",
    titleLineOne: "Penser",
    titleLineTwo: "ensemble.",
    introduction: "Un espace public pour éprouver les idées, déplacer les regards et faire vivre la philosophie dans la cité.",
    discover: "Découvrir le programme",
  },
  de: {
    skipToContent: "Zum Inhalt springen",
    eyebrow: "Philosophischer Verein · Genf",
    titleLineOne: "Gemeinsam",
    titleLineTwo: "denken.",
    introduction: "Ein öffentlicher Raum, um Ideen zu prüfen, Perspektiven zu verschieben und Philosophie in der Stadt lebendig zu halten.",
    discover: "Programm entdecken",
  },
  it: {
    skipToContent: "Vai al contenuto",
    eyebrow: "Associazione di filosofia · Ginevra",
    titleLineOne: "Pensare",
    titleLineTwo: "insieme.",
    introduction: "Uno spazio pubblico per mettere alla prova le idee, cambiare prospettiva e far vivere la filosofia nella città.",
    discover: "Scopri il programma",
  },
  en: {
    skipToContent: "Skip to content",
    eyebrow: "Philosophy association · Geneva",
    titleLineOne: "Thinking",
    titleLineTwo: "together.",
    introduction: "A public space to test ideas, shift perspectives, and keep philosophy alive in the city.",
    discover: "Explore the programme",
  },
});

export const landingPageDefaultText = defaultText(landingPageText);
