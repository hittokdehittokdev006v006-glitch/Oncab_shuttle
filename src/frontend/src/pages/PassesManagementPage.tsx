import React, { useState, useEffect, useCallback } from 'react';
import { passesAPI } from '../services/api';
import { Card, Table, Tr, Td, Pagination, SearchInput, Button, Select, StatusBadge, Modal, Input, ConfirmDialog, ErrorState, Badge } from '../components/ui';
import { Plus, Edit2, Trash2, Clock } from 'lucide-react';

interface PassesManagementPageProps { onNotify: (msg: string, type?: any) => void; }

export const PassesManagementPage: React.FC<PassesManagementPageProps> = ({ onNotify }) => {
  const [passes, setPasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, limit: 15 });
  const [showModal, setShowModal] = useState(false);
  const [editPass, setEditPass] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ passenger_id: '', pass_type: 'Monthly', total_trips: '30', amount: '0', valid_from: '', valid_until: '', status: 'Active' });

  const fetch = useCallback(async () => {
    try {
      setLoading(true); setError('');
      const r = await passesAPI.list({ page, limit: 15, search, status: statusFilter });
      setPasses(r.data.data);
      setPagination(r.data.pagination);
    } catch (e: any) { setError(e.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  }, [page, search, statusFilter]);

  useEffect(() => { fetch(); }, [fetch]);
  useEffect(() => { setPage(1); }, [search, statusFilter]);

  const openCreate = () => { setEditPass(null); setForm({ passenger_id: '', pass_type: 'Monthly', total_trips: '30', amount: '0', valid_from: '', valid_until: '', status: 'Active' }); setShowModal(true); };
  const openEdit = (p: any) => { setEditPass(p); setForm({ passenger_id: String(p.passenger_id), pass_type: p.pass_type, total_trips: String(p.total_trips), amount: String(p.amount), valid_from: p.valid_from || '', valid_until: p.valid_until || '', status: p.status }); setShowModal(true); };
  const f = (k: keyof typeof form) => (v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editPass) { await passesAPI.update(editPass.id, form); onNotify('Pass updated'); }
      else { await passesAPI.create(form); onNotify('Pass created'); }
      setShowModal(false); fetch();
    } catch (e: any) { onNotify(e.response?.data?.message || 'Failed', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await passesAPI.delete(deleteTarget.id); onNotify('Pass deleted'); setDeleteTarget(null); fetch(); }
    catch (e: any) { onNotify(e.response?.data?.message || 'Failed', 'error'); }
    finally { setDeleting(false); }
  };

  const HEADERS = ['Pass Code', 'Passenger', 'Type', 'Trips', 'Validity', 'Amount', 'Status', 'Actions'];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h2 className="text-white font-semibold">Pass Management</h2><p className="text-slate-500 text-sm">{pagination.total} passes</p></div>
        <Button onClick={openCreate}><Plus size={14} />Issue Pass</Button>
      </div>
      <div className="flex flex-wrap gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search pass code..." />
        <Select value={statusFilter} onChange={setStatusFilter} options={[{ value: 'Active', label: 'Active' }, { value: 'Expired', label: 'Expired' }, { value: 'Exhausted', label: 'Exhausted' }]} placeholder="All Statuses" />
      </div>
      <Card padding={false}>
        {error ? <ErrorState message={error} onRetry={fetch} /> : (
          <>
            <Table headers={HEADERS} loading={loading} empty={!loading && passes.length === 0} emptyMessage="No passes found">
              {passes.map((p) => {
                const daysLeft = p.valid_until ? Math.ceil((new Date(p.valid_until).getTime() - Date.now()) / 86400000) : null;
                return (
                  <Tr key={p.id}>
                    <Td><div className="text-white text-sm font-mono">{p.pass_code}</div></Td>
                    <Td><div className="text-white text-sm">{p.passenger?.name || '—'}</div><div className="text-slate-500 text-xs">{p.passenger?.mobile}</div></Td>
                    <Td><Badge color="blue">{p.pass_type}</Badge></Td>
                    <Td><div className="text-xs"><span className="text-white">{p.used_trips || 0}</span><span className="text-slate-500">/{p.total_trips}</span></div></Td>
                    <Td>
                      {daysLeft !== null && (
                        <div className="flex items-center gap-1.5 text-xs" style={{ color: daysLeft < 7 ? '#ef4444' : daysLeft < 30 ? '#f59e0b' : '#10b981' }}>
                          <Clock size={11} />{daysLeft > 0 ? `${daysLeft}d left` : 'Expired'}
                        </div>
                      )}
                      <div className="text-slate-500 text-xs">{p.valid_until ? new Date(p.valid_until).toLocaleDateString() : '—'}</div>
                    </Td>
                    <Td className="text-emerald-400 text-sm font-semibold">₹{p.amount}</Td>
                    <Td><StatusBadge status={p.status} /></Td>
                    <Td>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(p)}><Edit2 size={13} /></Button>
                        <Button variant="danger" size="sm" onClick={() => setDeleteTarget(p)}><Trash2 size={13} /></Button>
                      </div>
                    </Td>
                  </Tr>
                );
              })}
            </Table>
            <Pagination page={page} pages={pagination.pages} total={pagination.total} limit={pagination.limit} onPageChange={setPage} />
          </>
        )}
      </Card>
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editPass ? 'Edit Pass' : 'Issue Pass'}
        footer={<><Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={handleSave} loading={saving}>{editPass ? 'Update' : 'Issue'}</Button></>}>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Passenger ID" value={form.passenger_id} onChange={f('passenger_id')} placeholder="Passenger ID" required />
          <div className="space-y-1.5"><label className="block text-xs font-medium text-slate-400">Pass Type</label>
            <Select value={form.pass_type} onChange={f('pass_type')} options={[{ value: 'Daily', label: 'Daily' }, { value: 'Weekly', label: 'Weekly' }, { value: 'Monthly', label: 'Monthly' }, { value: 'Annual', label: 'Annual' }]} /></div>
          <Input label="Total Trips" type="number" value={form.total_trips} onChange={f('total_trips')} placeholder="30" />
          <Input label="Amount (₹)" type="number" value={form.amount} onChange={f('amount')} placeholder="999" />
          <Input label="Valid From" type="date" value={form.valid_from} onChange={f('valid_from')} />
          <Input label="Valid Until" type="date" value={form.valid_until} onChange={f('valid_until')} />
        </div>
      </Modal>
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Pass" message={`Delete pass "${deleteTarget?.pass_code}"?`} loading={deleting} />
    </div>
  );
};
