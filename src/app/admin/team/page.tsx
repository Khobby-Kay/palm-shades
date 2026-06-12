'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { getSupabaseBrowser } from '@/lib/tiwa/supabase';
import {
  ASSIGNABLE_ADMIN_PERMISSIONS,
  roleDisplayLabel,
  type AdminPermissionKey,
} from '@/lib/admin/permissions';

type TeamMember = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  admin_permissions: AdminPermissionKey[];
  created_at: string;
};

export default function AdminTeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formName, setFormName] = useState('');
  const [formPermissions, setFormPermissions] = useState<AdminPermissionKey[]>([
    'dashboard',
    'orders',
  ]);

  const groupedPermissions = useMemo(() => {
    const groups = new Map<string, typeof ASSIGNABLE_ADMIN_PERMISSIONS>();
    for (const perm of ASSIGNABLE_ADMIN_PERMISSIONS) {
      const list = groups.get(perm.group) ?? [];
      list.push(perm);
      groups.set(perm.group, list);
    }
    return [...groups.entries()];
  }, []);

  const authHeaders = useCallback(async () => {
    const { data: { session } } = await getSupabaseBrowser().auth.getSession();
    return {
      'Content-Type': 'application/json',
      ...(session?.access_token
        ? { Authorization: `Bearer ${session.access_token}` }
        : {}),
    };
  }, []);

  const loadTeam = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/team', {
        headers: await authHeaders(),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed to load team');
      setMembers(json.members ?? []);
    } catch (err: any) {
      setError(err.message ?? 'Failed to load team');
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => {
    loadTeam();
  }, [loadTeam]);

  function togglePermission(key: AdminPermissionKey) {
    setFormPermissions((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  function startEdit(member: TeamMember) {
    setEditingId(member.id);
    setFormName(member.full_name ?? '');
    setFormPassword('');
    setFormPermissions(member.admin_permissions);
    setShowCreate(false);
  }

  function resetForm() {
    setEditingId(null);
    setShowCreate(false);
    setFormEmail('');
    setFormPassword('');
    setFormName('');
    setFormPermissions(['dashboard', 'orders']);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/team', {
        method: 'POST',
        headers: await authHeaders(),
        body: JSON.stringify({
          email: formEmail,
          password: formPassword,
          fullName: formName,
          permissions: formPermissions,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed to create user');
      resetForm();
      await loadTeam();
    } catch (err: any) {
      setError(err.message ?? 'Failed to create user');
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/team/${editingId}`, {
        method: 'PATCH',
        headers: await authHeaders(),
        body: JSON.stringify({
          fullName: formName,
          permissions: formPermissions,
          ...(formPassword ? { password: formPassword } : {}),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed to update user');
      resetForm();
      await loadTeam();
    } catch (err: any) {
      setError(err.message ?? 'Failed to update user');
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(id: string, email: string) {
    if (!confirm(`Remove admin access for ${email}? They will become a customer.`)) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/team/${id}`, {
        method: 'DELETE',
        headers: await authHeaders(),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed to remove access');
      await loadTeam();
    } catch (err: any) {
      setError(err.message ?? 'Failed to remove access');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team &amp; Access</h1>
          <p className="text-gray-600 mt-1">
            Super admins have full access. Create staff accounts and choose what each person can see.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            resetForm();
            setShowCreate(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
        >
          <i className="ri-user-add-line mr-2" />
          Add team member
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      {(showCreate || editingId) && (
        <form
          onSubmit={editingId ? handleUpdate : handleCreate}
          className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            {editingId ? 'Edit team member' : 'New team member'}
          </h2>

          <div className="grid gap-4 md:grid-cols-2 mb-6">
            {!editingId && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Full name</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                {editingId ? 'New password (optional)' : 'Password'}
              </label>
              <input
                type="password"
                required={!editingId}
                minLength={8}
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
          </div>

          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-900 mb-3">Access permissions</p>
            <div className="space-y-4">
              {groupedPermissions.map(([group, perms]) => (
                <div key={group}>
                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">{group}</p>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {perms.map((perm) => (
                      <label
                        key={perm.key}
                        className="flex items-start gap-2 rounded-lg border border-gray-200 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formPermissions.includes(perm.key)}
                          onChange={() => togglePermission(perm.key)}
                          className="mt-1"
                        />
                        <span>
                          <span className="block text-sm font-medium text-gray-900">
                            {perm.label}
                          </span>
                          <span className="block text-xs text-gray-500">{perm.description}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving…' : editingId ? 'Save changes' : 'Create member'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-600">
            <tr>
              <th className="px-4 py-3 font-semibold">Member</th>
              <th className="px-4 py-3 font-semibold">Role</th>
              <th className="px-4 py-3 font-semibold">Access</th>
              <th className="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  Loading team…
                </td>
              </tr>
            ) : members.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  No team members yet.
                </td>
              </tr>
            ) : (
              members.map((member) => (
                <tr key={member.id} className="border-t border-gray-100">
                  <td className="px-4 py-4">
                    <p className="font-semibold text-gray-900">
                      {member.full_name || member.email}
                    </p>
                    <p className="text-gray-500">{member.email}</p>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${
                        member.role === 'admin'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {roleDisplayLabel(member.role)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-gray-600">
                    {member.role === 'admin'
                      ? 'Full access'
                      : `${member.admin_permissions.length} area(s)`}
                  </td>
                  <td className="px-4 py-4 text-right">
                    {member.role === 'staff' ? (
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(member)}
                          className="px-3 py-1.5 text-blue-700 hover:bg-blue-50 rounded-lg font-medium"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemove(member.id, member.email)}
                          className="px-3 py-1.5 text-red-700 hover:bg-red-50 rounded-lg font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">Protected</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
