import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../AuthContext";
import { useText } from "../../../i18n/useText";
import { BrandMark } from "../../ui/BrandMark/BrandMark";
import { Button } from "../../ui/Button/Button";
import { LanguageSelector } from "../../ui/LanguageSelector/LanguageSelector";
import { adminHeaderText } from "./AdminHeader.text";
import styles from "./AdminHeader.module.css";

export function AdminHeader() {
  const { user, logout } = useAuth();
  const text = useText(adminHeaderText);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  const onLogout = async () => { await logout(); navigate("/login"); };

  return <header className={styles.header}>
    <Link className={styles.brand} to="/" aria-label={text.brand} onClick={closeMenu}><BrandMark compact /></Link>
    <nav id="admin-navigation" className={`${styles.navigation} ${menuOpen ? styles.navigationOpen : ""}`} aria-label={text.navigation}>
      <Link to="/" onClick={closeMenu}>{text.home}</Link>
      {user?.role === "admin" && <Link to="/espace-membre" onClick={closeMenu}>{text.dashboard}</Link>}
      {user?.role === "admin" && <Link to="/admin/media" onClick={closeMenu}>{text.mediaLibrary}</Link>}
      {user?.role === "admin" && <Link to="/admin/users" onClick={closeMenu}>{text.users}</Link>}
      {user?.role === "admin" && <Link to="/admin/invitations" onClick={closeMenu}>{text.invite}</Link>}
      <Button className={styles.signOut} variant="ghost" onClick={onLogout}>{text.signOut}</Button>
    </nav>
    <div className={styles.language}><LanguageSelector /></div>
    <button className={`${styles.menuButton} ${menuOpen ? styles.menuButtonOpen : ""}`} type="button" aria-controls="admin-navigation" aria-expanded={menuOpen} aria-label={menuOpen ? text.closeMenu : text.openMenu} onClick={() => setMenuOpen((open) => !open)}>
      <span aria-hidden="true" /><span aria-hidden="true" /><span aria-hidden="true" />
    </button>
  </header>;
}
