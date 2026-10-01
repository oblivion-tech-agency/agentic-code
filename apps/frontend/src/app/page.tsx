'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconEdit, IconTrash, IconUserPlus } from '@tabler/icons-react';
import { clearToken, getConfig, getMe, readToken } from '../lib/auth';
import { getUsers, createUser, updateUser, deleteUser } from '../lib/users';
import type { AuthUser, NavbarConfig } from '../types/auth';
import type { User, CreateUserInput, UpdateUserInput } from '../types/user';

const primaryButtonClassName =
  'inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 font-medium text-primary-foreground transition hover:opacity-90';

type SessionState = {
  user: AuthUser;
  config: NavbarConfig;
};

export default function Home() {
  const router = useRouter();
  const [session, setSession] = useState<SessionState | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = readToken();

    if (!token) {
      setIsCheckingSession(false);
      return;
    }

    Promise.all([getMe(token), getConfig(token)])
      .then(([user, config]) => {
        setSession({ user, config });
      })
      .catch(() => {
        clearToken();
        setSession(null);
      })
      .finally(() => {
        setIsCheckingSession(false);
      });
  }, []);

  useEffect(() => {
    if (!session) return;
    fetchUsers();
  }, [session]);

  useEffect(() => {
    if (!isCheckingSession && !session) {
      router.push('/auth');
    }
  }, [isCheckingSession, session, router]);

  async function fetchUsers() {
    setUsersLoading(true);
    setUsersError('');
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setUsersError(err instanceof Error ? err.message : 'Error al cargar usuarios');
    } finally {
      setUsersLoading(false);
    }
  }

  function handleLogout() {
    clearToken();
    setSession(null);
  }

  function openCreateModal() {
    setModalMode('create');
    setEditingUser(null);
    setForm({ firstName: '', lastName: '', email: '', password: '' });
    setModalOpen(true);
  }

  function openEditModal(user: User) {
    setModalMode('edit');
    setEditingUser(user);
    setForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: '',
    });
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    setUsersError('');
    try {
      if (modalMode === 'create') {
        await createUser(form as CreateUserInput);
      } else if (editingUser) {
        const payload: UpdateUserInput = {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
        };
        if (form.password) payload.password = form.password;
        await updateUser(editingUser.id, payload);
      }
      setModalOpen(false);
      await fetchUsers();
    } catch (err) {
      setUsersError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(user: User) {
    if (!window.confirm(`¿Eliminar a ${user.firstName} ${user.lastName}?`)) return;
    setUsersError('');
    try {
      await deleteUser(user.id);
      await fetchUsers();
    } catch (err) {
      setUsersError(err instanceof Error ? err.message : 'Error al eliminar');
    }
  }

  if (isCheckingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-12">
        <p className="text-muted">Checking session...</p>
      </main>
    );
  }

  if (session) {
    return (
      <main className="min-h-screen bg-surface">
        <nav className="mx-auto flex w-full max-w-5xl items-center justify-between rounded-2xl border border-surface-border bg-surface px-5 py-4 shadow-sm">
          <div>
            <p className="text-lg font-semibold text-foreground">{session.config.appName}</p>
            <p className="text-sm text-muted">
              {session.config.environment} · {session.config.supportEmail}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">
                {session.user.firstName} {session.user.lastName}
              </p>
              <p className="text-sm text-muted">{session.user.email}</p>
            </div>

            <button type="button" onClick={handleLogout} className={primaryButtonClassName}>
              Log out
            </button>
          </div>
        </nav>

        <div className="mx-auto max-w-5xl px-6 py-8">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="flex items-center gap-2.5 text-[22px] font-medium tracking-tight text-foreground">
                Administración de Usuarios
                {!usersLoading && (
                  <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full border border-surface-border bg-surface px-1.5 text-xs font-medium text-muted">
                    {users.length}
                  </span>
                )}
              </h1>
              <p className="mt-1 text-sm text-muted">
                Gestiona los usuarios registrados en el sistema
              </p>
            </div>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              <IconUserPlus size={18} />
              Crear usuario
            </button>
          </div>

          {/* Error */}
          {usersError && (
            <p className="mb-4 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
              {usersError}
            </p>
          )}

          {/* Table */}
          <div className="overflow-hidden rounded-2xl border border-surface-border bg-surface shadow-sm">
            {usersLoading ? (
              <div className="flex items-center justify-center py-16">
                <p className="text-sm text-muted">Cargando usuarios...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="flex items-center justify-center py-16">
                <p className="text-sm text-muted">No hay usuarios registrados.</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-border text-left text-xs font-medium uppercase tracking-wide text-muted">
                    <th className="px-5 py-3">Nombre</th>
                    <th className="px-5 py-3">Email</th>
                    <th className="px-5 py-3">Creado</th>
                    <th className="px-5 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-t border-surface-border/50">
                      <td className="px-5 py-3 font-medium text-foreground">
                        {user.firstName} {user.lastName}
                      </td>
                      <td className="px-5 py-3 text-muted">{user.email}</td>
                      <td className="px-5 py-3 text-muted">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="inline-flex gap-1">
                          <button
                            onClick={() => openEditModal(user)}
                            className="rounded-lg p-2 text-primary transition hover:opacity-80"
                            title="Editar"
                          >
                            <IconEdit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(user)}
                            className="rounded-lg p-2 text-danger transition hover:opacity-80"
                            title="Eliminar"
                          >
                            <IconTrash size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Modal crear/editar */}
        {modalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
            onClick={() => setModalOpen(false)}
          >
            <div
              className="w-full max-w-sm rounded-2xl border border-surface-border bg-surface px-8 pb-8 pt-6 shadow-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="mb-1 text-[18px] font-medium tracking-tight text-foreground">
                {modalMode === 'create' ? 'Crear usuario' : 'Editar usuario'}
              </h2>
              <p className="mb-5 text-sm text-muted">
                {modalMode === 'create'
                  ? 'Completa los datos del nuevo usuario'
                  : 'Actualiza los datos del usuario'}
              </p>

              <div className="flex flex-col gap-4">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">
                      Nombre
                    </label>
                    <input
                      type="text"
                      value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      className="h-[38px] w-full rounded-lg border border-surface-border bg-surface px-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">
                      Apellido
                    </label>
                    <input
                      type="text"
                      value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      className="h-[38px] w-full rounded-lg border border-surface-border bg-surface px-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="h-[38px] w-full rounded-lg border border-surface-border bg-surface px-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                    required
                  />
                </div>

                {modalMode === 'create' && (
                  <div>
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">
                      Contraseña
                    </label>
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="h-[38px] w-full rounded-lg border border-surface-border bg-surface px-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                      required
                      minLength={8}
                    />
                  </div>
                )}

                {modalMode === 'edit' && (
                  <div>
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">
                      Nueva contraseña{' '}
                      <span className="font-normal normal-case text-muted/60">(opcional)</span>
                    </label>
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="Dejar vacío para no cambiar"
                      className="h-[38px] w-full rounded-lg border border-surface-border bg-surface px-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                      minLength={8}
                    />
                  </div>
                )}

                <div className="mt-2 flex gap-3">
                  <button
                    onClick={() => setModalOpen(false)}
                    className="flex-1 rounded-lg border border-surface-border px-4 py-2.5 text-sm font-medium text-muted transition hover:opacity-80"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    );
  }

  return null;
}
