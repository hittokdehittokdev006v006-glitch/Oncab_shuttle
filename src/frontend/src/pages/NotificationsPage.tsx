import React, { useState, useEffect, useCallback } from 'react';
import { notificationsAPI } from '../services/api';
import { Card, Table, Tr, Td, Pagination, Button, StatusBadge, ErrorState, Modal, Input, Select } from '../components/ui';
import { Bell, CheckCheck, Trash2, Plus, Send } from 'lucide-react';

interface NotificationsPageProps { onNotify: (msg: string, type?: any) => void; }

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ onNotify }) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, limit: 15 });
  const [unreadCount, setUnreadCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ type: 'General', title: '', message: '', target_type: 'all', channel: 'in_app' });

  const fetch = useCallback(async () => {
    try {
      setLoading(true); setError('');
      const r = await notificationsAPI.list({ page, limit: 15 });
      setNotifications(r.data.data);
      setPagination(r.data.pagination);
      setUnreadCount(r.data.unread_count || 0);
    } catch (e: any) { setError(e.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleMarkRead = async (id: number) => {
    try { await notificationsAPI.markRead(id); fetch(); } catch { onNotify('Failed', 'error'); }
  };

  const handleMarkAllRead = async () => {
    try { await notificationsAPI.markAllRead(); onNotify('All marked as read'); fetch(); } catch { onNotify('Failed', 'error'); }
  };

  const handleDelete = async (id: number) => {
    try { await notificationsAPI.delete(id); fetch(); } catch { onNotify('Failed', 'error'); }
  };

  const handleSend = async () => {
    if (!form.title || !form.message) { onNotify('Title and message required', 'error'); return; }
    setSending(true);
    try { await notificationsAPI.send(form); onNotify('Notification sent'); setShowModal(false); setForm({ type: 'General', title: '', message: '', target_type: 'all', channel: 'in_app' }); fetch(); }
    catch (e: any) { onNotify(e.response?.data?.message || 'Failed', 'error'); }
    finally { setSending(false); }
  };

  const f = (k: keyof typeof form) => (v: string) => setForm(prev => ({ ...prev, [k]: v }));
  const HEADERS = ['Notification', 'Type', 'Target', 'Status', 'Sent', 'Actions'];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-semibold">Notifications</h2>
          <p className="text-slate-500 text-sm">{unreadCount} unread</p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && <Button variant="secondary" onClick={handleMarkAllRead}><CheckCheck size={14} />Mark all read</Button>}
          <Button onClick={() => setShowModal(true)}><Plus size={14} />Send Notification</Button>
        </div>
      </div>
      <Card padding={false}>
        {error ? <ErrorState message={error} onRetry={fetch} /> : (
          <>
            <Table headers={HEADERS} loading={loading} empty={!loading && notifications.length === 0} emptyMessage="No notifications">
              {notifications.map((n) => (
                <Tr key={n.id}>
                  <Td>
                    <div className="flex items-start gap-3">
                      {!n.read_at && <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ background: '#6366f1' }} />}
                      <div className={!n.read_at ? '' : 'ml-5'}>
                        <div className="text-white text-sm font-medium">{n.title}</div>
                        <div className="text-slate-500 text-xs mt-0.5 line-clamp-1">{n.message}</div>
                      </div>
                    </div>
                  </Td>
                  <Td className="text-xs text-slate-400">{n.type}</Td>
                  <Td className="text-xs text-slate-400 capitalize">{n.target_type}</Td>
                  <Td>{n.read_at ? <span className="text-xs text-slate-500">Read</span> : <span className="text-xs text-indigo-400 font-medium">Unread</span>}</Td>
                  <Td className="text-xs text-slate-500">{n.created_at ? new Date(n.created_at).toLocaleDateString() : '—'}</Td>
                  <Td>
                    <div className="flex gap-1">
                      {!n.read_at && <Button variant="ghost" size="sm" onClick={() => handleMarkRead(n.id)}><CheckCheck size={12} /></Button>}
                      <Button variant="danger" size="sm" onClick={() => handleDelete(n.id)}><Trash2 size={12} /></Button>
                    </div>
                  </Td>
                </Tr>
              ))}
            </Table>
            <Pagination page={page} pages={pagination.pages} total={pagination.total} limit={pagination.limit} onPageChange={setPage} />
          </>
        )}
      </Card>
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Send Notification"
        footer={<><Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={handleSend} loading={sending}><Send size={14} />Send</Button></>}>
        <div className="space-y-4">
          <Input label="Title" value={form.title} onChange={f('title')} placeholder="Notification title" required />
          <div className="space-y-1.5"><label className="block text-xs font-medium text-slate-400">Message <span style={{ color: '#ef4444' }}>*</span></label>
            <textarea value={form.message} onChange={(e) => f('message')(e.target.value)} rows={3} placeholder="Notification message..." className="w-full px-3 py-2 rounded-lg text-sm resize-none" style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(99, 102, 241, 0.2)', color: 'white', outline: 'none' }} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><label className="block text-xs font-medium text-slate-400">Target</label>
              <Select value={form.target_type} onChange={f('target_type')} options={[{ value: 'all', label: 'Everyone' }, { value: 'admin', label: 'Admins' }, { value: 'operator', label: 'Operators' }, { value: 'passenger', label: 'Passengers' }, { value: 'driver', label: 'Drivers' }]} /></div>
            <div className="space-y-1.5"><label className="block text-xs font-medium text-slate-400">Channel</label>
              <Select value={form.channel} onChange={f('channel')} options={[{ value: 'in_app', label: 'In-App' }, { value: 'email', label: 'Email' }, { value: 'sms', label: 'SMS' }, { value: 'push', label: 'Push' }]} /></div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
