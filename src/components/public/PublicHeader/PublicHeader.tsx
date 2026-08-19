import { useState } from "react";
import { Link } from "react-router-dom";
import { useText } from "../../../i18n/useText";
import { BrandMark } from "../../ui/BrandMark/BrandMark";
import { LanguageSelector } from "../../ui/LanguageSelector/LanguageSelector";
import { publicHeaderText } from "./PublicHeader.text";
import styles from "./PublicHeader.module.css";

export function PublicHeader() {
  const text = useText(publicHeaderText);
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return <header className={styles.header}>
    <Link className={styles.brand} to="/" aria-label={text.brand}><BrandMark compact /></Link>
    <nav id="public-navigation" className={`${styles.navigation} ${menuOpen ? styles.navigationOpen : ""}`} aria-label={text.navigation}>
      <Link to="/programme" onClick={closeMenu}>{text.programme}</Link>
      <Link to="/podcasts" onClick={closeMenu}>{text.podcasts}</Link>
      <Link to="/#association" onClick={closeMenu}>{text.about}</Link>
      <Link to="/archives" onClick={closeMenu}>{text.archives}</Link>
      <Link className={styles.memberLink} to="/login" onClick={closeMenu}>{text.memberSpace}</Link>
    </nav>
    <div className={styles.languageControl}><LanguageSelector /></div>
    <button className={`${styles.menuButton} ${menuOpen ? styles.menuButtonOpen : ""}`} type="button" aria-controls="public-navigation" aria-expanded={menuOpen} aria-label={menuOpen ? text.closeMenu : text.openMenu} onClick={() => setMenuOpen((open) => !open)}>
      <span aria-hidden="true" /><span aria-hidden="true" /><span aria-hidden="true" />
    </button>
  </header>;
}
