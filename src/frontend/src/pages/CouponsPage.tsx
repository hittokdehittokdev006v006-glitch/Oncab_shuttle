import React, { useState, useEffect, useCallback } from 'react';
import { couponsAPI } from '../services/api';
import { Card, Table, Tr, Td, Pagination, SearchInput, Button, Select, StatusBadge, Modal, Input, ConfirmDialog, ErrorState, Badge } from '../components/ui';
import { Plus, Edit2, Trash2, Tag } from 'lucide-react';

interface CouponsPageProps { onNotify: (msg: string, type?: any) => void; }

export const CouponsPage: React.FC<CouponsPageProps> = ({ onNotify }) => {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, limit: 15 });
  const [showModal, setShowModal] = useState(false);
  const [editCoupon, setEditCoupon] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ code: '', code_type: 'FLAT', amount: '0', max_discount: '', min_amount: '0', usage_limit: '', start_date: '', end_date: '', description: '', status: 'Active' });

  const fetch = useCallback(async () => {
    try {
      setLoading(true); setError('');
      const r = await couponsAPI.list({ page, limit: 15, search, status: statusFilter });
      setCoupons(r.data.data);
      setPagination(r.data.pagination);
    } catch (e: any) { setError(e.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  }, [page, search, statusFilter]);

  useEffect(() => { fetch(); }, [fetch]);
  useEffect(() => { setPage(1); }, [search, statusFilter]);

  const openCreate = () => { setEditCoupon(null); setForm({ code: '', code_type: 'FLAT', amount: '0', max_discount: '', min_amount: '0', usage_limit: '', start_date: '', end_date: '', description: '', status: 'Active' }); setShowModal(true); };
  const openEdit = (c: any) => { setEditCoupon(c); setForm({ code: c.code, code_type: c.code_type, amount: String(c.amount), max_discount: String(c.max_discount || ''), min_amount: String(c.min_amount || '0'), usage_limit: String(c.usage_limit || ''), start_date: c.start_date || '', end_date: c.end_date || '', description: c.description || '', status: c.status }); setShowModal(true); };
  const f = (k: keyof typeof form) => (v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSave = async () => {
    if (!form.code || !form.amount) { onNotify('Code and amount required', 'error'); return; }
    setSaving(true);
    try {
      if (editCoupon) { await couponsAPI.update(editCoupon.id, form); onNotify('Coupon updated'); }
      else { await couponsAPI.create(form); onNotify('Coupon created'); }
      setShowModal(false); fetch();
    } catch (e: any) { onNotify(e.response?.data?.message || 'Failed', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await couponsAPI.delete(deleteTarget.id); onNotify('Deleted'); setDeleteTarget(null); fetch(); }
    catch (e: any) { onNotify(e.response?.data?.message || 'Failed', 'error'); }
    finally { setDeleting(false); }
  };

  const HEADERS = ['Code', 'Type', 'Discount', 'Min Order', 'Used', 'Expires', 'Status', 'Actions'];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h2 className="text-white font-semibold">Coupons & Discounts</h2><p className="text-slate-500 text-sm">{pagination.total} coupons</p></div>
        <Button onClick={openCreate}><Plus size={14} />Create Coupon</Button>
      </div>
      <div className="flex flex-wrap gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search coupon code..." />
        <Select value={statusFilter} onChange={setStatusFilter} options={[{ value: 'Active', label: 'Active' }, { value: 'Inactive', label: 'Inactive' }, { value: 'Expired', label: 'Expired' }]} placeholder="All Statuses" />
      </div>
      <Card padding={false}>
        {error ? <ErrorState message={error} onRetry={fetch} /> : (
          <>
            <Table headers={HEADERS} loading={loading} empty={!loading && coupons.length === 0} emptyMessage="No coupons found">
              {coupons.map((c) => (
                <Tr key={c.id}>
                  <Td>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: 'rgba(245, 158, 11, 0.1)' }}><Tag size={13} style={{ color: '#f59e0b' }} /></div>
                      <div className="text-white font-mono font-bold text-sm">{c.code}</div>
                    </div>
                  </Td>
                  <Td><Badge color={c.code_type === 'FLAT' ? 'blue' : 'purple'}>{c.code_type}</Badge></Td>
                  <Td>
                    <div className="text-emerald-400 font-semibold text-sm">
                      {c.code_type === 'FLAT' ? `₹${c.amount}` : `${c.amount}%`}
                    </div>
                    {c.max_discount && <div className="text-slate-500 text-xs">Max ₹{c.max_discount}</div>}
                  </Td>
                  <Td className="text-xs text-slate-300">₹{c.min_amount || 0}</Td>
                  <Td className="text-xs">
                    <span className="text-white">{c.used_count || 0}</span>
                    {c.usage_limit && <span className="text-slate-500">/{c.usage_limit}</span>}
                  </Td>
                  <Td className="text-xs text-slate-400">{c.end_date ? new Date(c.end_date).toLocaleDateString() : 'No expiry'}</Td>
                  <Td><StatusBadge status={c.status} /></Td>
                  <Td>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(c)}><Edit2 size={13} /></Button>
                      <Button variant="danger" size="sm" onClick={() => setDeleteTarget(c)}><Trash2 size={13} /></Button>
                    </div>
                  </Td>
                </Tr>
              ))}
            </Table>
            <Pagination page={page} pages={pagination.pages} total={pagination.total} limit={pagination.limit} onPageChange={setPage} />
          </>
        )}
      </Card>
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editCoupon ? 'Edit Coupon' : 'Create Coupon'}
        footer={<><Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={handleSave} loading={saving}>{editCoupon ? 'Update' : 'Create'}</Button></>}>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Coupon Code" value={form.code} onChange={f('code')} placeholder="WELCOME20" required className="col-span-2" />
          <div className="space-y-1.5"><label className="block text-xs font-medium text-slate-400">Discount Type</label>
            <Select value={form.code_type} onChange={f('code_type')} options={[{ value: 'FLAT', label: 'Flat (₹)' }, { value: 'PERCENT', label: 'Percent (%)' }]} /></div>
          <Input label={form.code_type === 'FLAT' ? 'Amount (₹)' : 'Percentage (%)'} type="number" value={form.amount} onChange={f('amount')} required />
          {form.code_type === 'PERCENT' && <Input label="Max Discount (₹)" type="number" value={form.max_discount} onChange={f('max_discount')} />}
          <Input label="Min Order (₹)" type="number" value={form.min_amount} onChange={f('min_amount')} />
          <Input label="Usage Limit" type="number" value={form.usage_limit} onChange={f('usage_limit')} placeholder="Unlimited" />
          <Input label="Start Date" type="date" value={form.start_date} onChange={f('start_date')} />
          <Input label="End Date" type="date" value={form.end_date} onChange={f('end_date')} />
          <Input label="Description" value={form.description} onChange={f('description')} placeholder="Coupon description" className="col-span-2" />
        </div>
      </Modal>
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Coupon" message={`Delete coupon "${deleteTarget?.code}"?`} loading={deleting} />
    </div>
  );
};
