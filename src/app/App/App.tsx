import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "../../AuthContext";
import { LanguageProvider } from "../../i18n/LanguageContext";
import { AcceptInvitationPage } from "../../pages/AcceptInvitationPage/AcceptInvitationPage";
import { AdminInvitationsPage } from "../../pages/AdminInvitationsPage/AdminInvitationsPage";
import { AdminUsersPage } from "../../pages/AdminUsersPage/AdminUsersPage";
import { DashboardPage } from "../../pages/DashboardPage/DashboardPage";
import { EventPage } from "../../pages/EventPage/EventPage";
import { LandingPage } from "../../pages/LandingPage/LandingPage";
import { LoginPage } from "../../pages/LoginPage/LoginPage";
import { ProtectedRoute } from "../../routing/ProtectedRoute/ProtectedRoute";
export default function App() { return <LanguageProvider><BrowserRouter><AuthProvider><Routes><Route path="/" element={<LandingPage />} /><Route path="/evenements/:eventId" element={<EventPage />} /><Route path="/login" element={<LoginPage />} /><Route path="/accept-invitation" element={<AcceptInvitationPage />} /><Route element={<ProtectedRoute />}><Route path="/espace-membre" element={<DashboardPage />} /></Route><Route element={<ProtectedRoute admin />}><Route path="/admin/invitations" element={<AdminInvitationsPage />} /><Route path="/admin/users" element={<AdminUsersPage />} /></Route><Route path="*" element={<Navigate to="/" replace />} /></Routes></AuthProvider></BrowserRouter></LanguageProvider>; }
