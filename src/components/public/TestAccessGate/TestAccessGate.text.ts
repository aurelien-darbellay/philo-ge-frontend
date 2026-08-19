import { defineTextMap } from "../../../i18n/textMap";

export const testAccessGateText = defineTextMap({
  fr: { eyebrow: "VERSION DE TEST", title: "Bienvenue sur le site de test.", body: "Cette version est en cours de développement. Saisissez le mot de passe pour continuer.", password: "Mot de passe", submit: "Continuer", error: "Mot de passe incorrect." },
  de: { eyebrow: "TESTVERSION", title: "Willkommen auf der Testseite.", body: "Diese Version befindet sich in Entwicklung. Geben Sie das Passwort ein, um fortzufahren.", password: "Passwort", submit: "Weiter", error: "Falsches Passwort." },
  it: { eyebrow: "VERSIONE DI TEST", title: "Benvenuti nel sito di test.", body: "Questa versione è in fase di sviluppo. Inserisci la password per continuare.", password: "Password", submit: "Continua", error: "Password errata." },
  en: { eyebrow: "TEST VERSION", title: "Welcome to the test site.", body: "This version is still in development. Enter the password to continue.", password: "Password", submit: "Continue", error: "Incorrect password." },
});
