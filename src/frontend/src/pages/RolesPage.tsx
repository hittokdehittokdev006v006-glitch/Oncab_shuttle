import React, { useState, useEffect, useCallback } from 'react';
import { rolesAPI } from '../services/api';
import { Card, Table, Tr, Td, Button, Modal, Input, ErrorState, Badge, LoadingState } from '../components/ui';
import { Plus, Edit2, Shield, Check } from 'lucide-react';

interface RolesPageProps { onNotify: (msg: string, type?: any) => void; }

export const RolesPage: React.FC<RolesPageProps> = ({ onNotify }) => {
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editRole, setEditRole] = useState<any>(null);
  const [permModal, setPermModal] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [assigningSaving, setAssigningSaving] = useState(false);
  const [selectedPerms, setSelectedPerms] = useState<number[]>([]);
  const [form, setForm] = useState({ name: '', display_name: '', description: '' });

  const fetch = useCallback(async () => {
    try {
      setLoading(true); setError('');
      const [rr, pr] = await Promise.all([rolesAPI.list(), rolesAPI.listPermissions()]);
      setRoles(rr.data.data);
      setPermissions(pr.data.data.grouped || {});
    } catch (e: any) { setError(e.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => { setEditRole(null); setForm({ name: '', display_name: '', description: '' }); setShowModal(true); };
  const openEdit = (r: any) => { setEditRole(r); setForm({ name: r.name, display_name: r.display_name || '', description: r.description || '' }); setShowModal(true); };
  const openPermissions = (r: any) => { setPermModal(r); setSelectedPerms((r.permissions || []).map((p: any) => p.id)); };
  const f = (k: keyof typeof form) => (v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSave = async () => {
    if (!form.name || !form.display_name) { onNotify('Name and display name required', 'error'); return; }
    setSaving(true);
    try {
      if (editRole) { await rolesAPI.update(editRole.id, form); onNotify('Role updated'); }
      else { await rolesAPI.create(form); onNotify('Role created'); }
      setShowModal(false); fetch();
    } catch (e: any) { onNotify(e.response?.data?.message || 'Failed', 'error'); }
    finally { setSaving(false); }
  };

  const handleAssignPerms = async () => {
    if (!permModal) return;
    setAssigningSaving(true);
    try { await rolesAPI.assignPermissions(permModal.id, selectedPerms); onNotify('Permissions updated'); setPermModal(null); fetch(); }
    catch (e: any) { onNotify(e.response?.data?.message || 'Failed', 'error'); }
    finally { setAssigningSaving(false); }
  };

  const togglePerm = (id: number) => setSelectedPerms(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  const toggleGroup = (perms: any[]) => {
    const ids = perms.map((p: any) => p.id);
    const allSelected = ids.every(id => selectedPerms.includes(id));
    if (allSelected) setSelectedPerms(prev => prev.filter(id => !ids.includes(id)));
    else setSelectedPerms(prev => Array.from(new Set([...prev, ...ids])));
  };

  const HEADERS = ['Role', 'Permissions', 'Users', 'Actions'];

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h2 className="text-white font-semibold">Roles & Permissions</h2><p className="text-slate-500 text-sm">{roles.length} roles</p></div>
        <Button onClick={openCreate}><Plus size={14} />New Role</Button>
      </div>
      {error ? <ErrorState message={error} onRetry={fetch} /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((role) => (
            <Card key={role.id}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(99, 102, 241, 0.1)' }}>
                    <Shield size={20} style={{ color: '#818cf8' }} />
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm">{role.display_name || role.name}</div>
                    <div className="text-slate-500 text-xs font-mono">{role.name}</div>
                  </div>
                </div>
              </div>
              {role.description && <p className="text-slate-400 text-xs mb-3">{role.description}</p>}
              <div className="flex flex-wrap gap-1 mb-3">
                {(role.permissions || []).slice(0, 4).map((p: any) => (
                  <Badge key={p.id} color="purple">{p.module}</Badge>
                ))}
                {(role.permissions || []).length > 4 && <Badge color="gray">+{(role.permissions || []).length - 4} more</Badge>}
                {(!role.permissions || role.permissions.length === 0) && <span className="text-slate-500 text-xs">No permissions assigned</span>}
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => openEdit(role)}><Edit2 size={12} />Edit</Button>
                <Button variant="secondary" size="sm" onClick={() => openPermissions(role)}><Shield size={12} />Permissions</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Role Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editRole ? 'Edit Role' : 'Create Role'} size="sm"
        footer={<><Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={handleSave} loading={saving}>{editRole ? 'Update' : 'Create'}</Button></>}>
        <div className="space-y-4">
          <Input label="Role Name (slug)" value={form.name} onChange={f('name')} placeholder="operator" required />
          <Input label="Display Name" value={form.display_name} onChange={f('display_name')} placeholder="Operator" required />
          <Input label="Description" value={form.description} onChange={f('description')} placeholder="Can manage operations" />
        </div>
      </Modal>

      {/* Permissions Assignment Modal */}
      <Modal open={!!permModal} onClose={() => setPermModal(null)} title={`Permissions: ${permModal?.display_name || permModal?.name}`} size="lg"
        footer={<><Button variant="ghost" onClick={() => setPermModal(null)}>Cancel</Button><Button onClick={handleAssignPerms} loading={assigningSaving}><Check size={14} />Save Permissions</Button></>}>
        <div className="space-y-4">
          {Object.entries(permissions).map(([module, perms]: [string, any]) => {
            const ids = (perms as any[]).map((p: any) => p.id);
            const allChecked = ids.every((id: number) => selectedPerms.includes(id));
            const someChecked = ids.some((id: number) => selectedPerms.includes(id));
            return (
              <div key={module}>
                <div className="flex items-center gap-2 mb-2">
                  <input type="checkbox" checked={allChecked} ref={(el) => { if (el) el.indeterminate = someChecked && !allChecked; }} onChange={() => toggleGroup(perms)} className="rounded" />
                  <span className="text-white font-medium text-sm capitalize">{module}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pl-5">
                  {(perms as any[]).map((p: any) => (
                    <label key={p.id} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-white/5">
                      <input type="checkbox" checked={selectedPerms.includes(p.id)} onChange={() => togglePerm(p.id)} className="rounded" />
                      <span className="text-slate-300 text-xs">{p.action}</span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
          {Object.keys(permissions).length === 0 && <p className="text-slate-500 text-sm text-center py-4">No permissions available. Seed permissions via SQL import.</p>}
        </div>
      </Modal>
    </div>
  );
};
