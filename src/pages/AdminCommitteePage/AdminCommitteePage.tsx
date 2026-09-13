import { useEffect, useMemo, useState } from "react";
import { api, ApiError } from "../../api";
import { useAuth } from "../../AuthContext";
import { Alert } from "../../components/ui/Alert/Alert";
import { Button } from "../../components/ui/Button/Button";
import { Card } from "../../components/ui/Card/Card";
import { PageHeader } from "../../components/ui/PageHeader/PageHeader";
import { TextField } from "../../components/ui/TextField/TextField";
import { useText } from "../../i18n/useText";
import { AppShell } from "../../layouts/AppShell/AppShell";
import type { CommitteeMember, CommitteeRole } from "../../types";
import { adminCommitteePageText } from "./AdminCommitteePage.text";
import styles from "./AdminCommitteePage.module.css";

const roleValues: CommitteeRole[] = ["treasurer", "secretary", "president", "member"];

export function AdminCommitteePage() {
  const text = useText(adminCommitteePageText);
  const { csrfToken } = useAuth();
  const [members, setMembers] = useState<CommitteeMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<CommitteeRole>("member");
  const [adding, setAdding] = useState(false);
  const [pendingRoleId, setPendingRoleId] = useState<number | null>(null);
  const [pendingRemoveId, setPendingRemoveId] = useState<number | null>(null);

  useEffect(() => {
    api.committeeMembers()
      .then((response) => {
        setMembers(response.members);
      })
      .catch(() => {
        setError(text.updateError);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [text.updateError]);

  const roleLabel = (role: CommitteeRole) => {
    switch (role) {
      case "treasurer":
        return text.treasurer;
      case "secretary":
        return text.secretary;
      case "president":
        return text.president;
      default:
        return text.member;
    }
  };

  const sortedMembers = useMemo(() => [...members].sort((left, right) => left.full_name.localeCompare(right.full_name)), [members]);

  const toErrorMessage = (caught: unknown, fallback: string) => {
    if (caught instanceof ApiError && caught.code === "committee_role_already_assigned") {
      return text.duplicateRole;
    }
    return fallback;
  };

  const addMember = async () => {
    if (!csrfToken || adding) return;
    setAdding(true);
    setError("");

    try {
      const response = await api.adminAddCommitteeMember(newName.trim(), newRole, csrfToken);
      setMembers((current) => [...current, response.member]);
      setNewName("");
      setNewRole("member");
      setShowAdd(false);
    } catch (caught) {
      setError(toErrorMessage(caught, text.addError));
    } finally {
      setAdding(false);
    }
  };

  const changeRole = async (member: CommitteeMember, role: CommitteeRole) => {
    if (!csrfToken || pendingRoleId !== null || role === member.role) return;
    setPendingRoleId(member.id);
    setError("");

    try {
      const response = await api.adminChangeCommitteeMemberRole(member.id, role, csrfToken);
      setMembers((current) => current.map((item) => item.id === member.id ? response.member : item));
    } catch (caught) {
      setError(toErrorMessage(caught, text.updateError));
    } finally {
      setPendingRoleId(null);
    }
  };

  const removeMember = async (member: CommitteeMember) => {
    if (!csrfToken || pendingRemoveId !== null) return;
    setPendingRemoveId(member.id);
    setError("");

    try {
      await api.adminDeleteCommitteeMember(member.id, csrfToken);
      setMembers((current) => current.filter((item) => item.id !== member.id));
    } catch {
      setError(text.removeError);
    } finally {
      setPendingRemoveId(null);
    }
  };

  return <AppShell><main className={styles.page}>
    <PageHeader eyebrow={text.eyebrow} title={text.title} lead={text.lead} />

    <div className={styles.toolbar}>
      <Button onClick={() => setShowAdd((current) => !current)}>{showAdd ? text.cancel : text.add}</Button>
    </div>

    {showAdd && <div className={styles.form}>
      <TextField
        label={text.fullName}
        value={newName}
        placeholder={text.fullNamePlaceholder}
        onChange={(event) => setNewName(event.target.value)}
      />
      <label>
        {text.role}
        <select className={styles.roleSelect} value={newRole} onChange={(event) => setNewRole(event.target.value as CommitteeRole)}>
          {roleValues.map((role) => <option key={role} value={role}>{roleLabel(role)}</option>)}
        </select>
      </label>
      <Button onClick={addMember} disabled={adding || newName.trim() === ""}>{adding ? text.adding : text.add}</Button>
      <Button variant="ghost" onClick={() => { setShowAdd(false); setNewName(""); setNewRole("member"); }}>{text.cancel}</Button>
    </div>}

    {error && <Alert>{error}</Alert>}

    <Card className={styles.tableCard}>
      {loading
        ? <div className={styles.empty}>{text.loading}</div>
        : sortedMembers.length === 0
          ? <div className={styles.empty}>{text.empty}</div>
          : <table className={styles.table}>
            <thead>
              <tr><th>{text.fullName}</th><th>{text.role}</th><th>{text.remove}</th></tr>
            </thead>
            <tbody>
              {sortedMembers.map((member) => <tr key={member.id}>
                <td><strong>{member.full_name}</strong></td>
                <td>
                  <select
                    className={styles.roleSelect}
                    value={member.role}
                    aria-label={text.roleFor.replace("{name}", member.full_name)}
                    disabled={pendingRoleId === member.id}
                    onChange={(event) => changeRole(member, event.target.value as CommitteeRole)}
                  >
                    {roleValues.map((role) => <option key={role} value={role}>{roleLabel(role)}</option>)}
                  </select>
                </td>
                <td>
                  <Button
                    variant="danger"
                    onClick={() => removeMember(member)}
                    aria-label={text.removeFor.replace("{name}", member.full_name)}
                    disabled={pendingRemoveId === member.id}
                  >
                    {pendingRemoveId === member.id ? text.removing : text.remove}
                  </Button>
                </td>
              </tr>)}
            </tbody>
          </table>}
    </Card>
  </main></AppShell>;
}
