import React, { useState, useEffect, useCallback } from 'react';
import { bookingsAPI } from '../services/api';
import { Card, Table, Tr, Td, Pagination, SearchInput, Button, Select, StatusBadge, ConfirmDialog, ErrorState, Badge } from '../components/ui';
import { XCircle, Eye } from 'lucide-react';

interface BookingsPageProps { onNotify: (msg: string, type?: any) => void; }

export const BookingsPage: React.FC<BookingsPageProps> = ({ onNotify }) => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, limit: 15 });
  const [cancelTarget, setCancelTarget] = useState<any>(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true); setError('');
      const resp = await bookingsAPI.list({ page, limit: 15, search, booking_status: bookingStatusFilter, payment_status: paymentStatusFilter });
      setBookings(resp.data.data);
      setPagination(resp.data.pagination);
    } catch (err: any) { setError(err.response?.data?.message || 'Failed to load bookings'); }
    finally { setLoading(false); }
  }, [page, search, bookingStatusFilter, paymentStatusFilter]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);
  useEffect(() => { setPage(1); }, [search, bookingStatusFilter, paymentStatusFilter]);

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try { await bookingsAPI.cancel(cancelTarget.id, 'Cancelled by admin'); onNotify('Booking cancelled'); setCancelTarget(null); fetchBookings(); }
    catch (err: any) { onNotify(err.response?.data?.message || 'Cancel failed', 'error'); }
    finally { setCancelling(false); }
  };

  const HEADERS = ['Booking', 'Passenger', 'Trip', 'Date', 'Amount', 'Payment', 'Status', 'Actions'];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h2 className="text-white font-semibold">Booking Management</h2><p className="text-slate-500 text-sm">{pagination.total} bookings</p></div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search reference, name, mobile..." />
        <Select value={bookingStatusFilter} onChange={setBookingStatusFilter} options={[{ value: 'confirmed', label: 'Confirmed' }, { value: 'cancelled', label: 'Cancelled' }, { value: 'completed', label: 'Completed' }, { value: 'pending', label: 'Pending' }]} placeholder="All Statuses" />
        <Select value={paymentStatusFilter} onChange={setPaymentStatusFilter} options={[{ value: 'pending', label: 'Pending' }, { value: 'paid', label: 'Paid' }, { value: 'failed', label: 'Failed' }, { value: 'refunded', label: 'Refunded' }]} placeholder="Payment Status" />
      </div>
      <Card padding={false}>
        {error ? <ErrorState message={error} onRetry={fetchBookings} /> : (
          <>
            <Table headers={HEADERS} loading={loading} empty={!loading && bookings.length === 0} emptyMessage="No bookings found">
              {bookings.map((b) => (
                <Tr key={b.id}>
                  <Td>
                    <div className="text-white text-sm font-mono font-medium">{b.booking_reference}</div>
                    <div className="text-slate-500 text-xs">{b.boarding_pass_code}</div>
                  </Td>
                  <Td>
                    <div className="text-white text-sm">{b.passenger_name}</div>
                    <div className="text-slate-500 text-xs">{b.passenger_mobile}</div>
                  </Td>
                  <Td className="text-xs text-slate-300">{b.trip?.schedule_code || '—'}</Td>
                  <Td className="text-xs text-slate-300">{b.travel_date}</Td>
                  <Td>
                    <div className="text-emerald-400 text-sm font-semibold">₹{b.final_amount}</div>
                    {b.discount_amount > 0 && <div className="text-slate-500 text-xs">-₹{b.discount_amount}</div>}
                  </Td>
                  <Td><StatusBadge status={b.payment_status} /></Td>
                  <Td><StatusBadge status={b.booking_status} /></Td>
                  <Td>
                    <div className="flex items-center gap-1">
                      {b.booking_status !== 'cancelled' && (
                        <Button variant="danger" size="sm" onClick={() => setCancelTarget(b)}><XCircle size={13} /></Button>
                      )}
                    </div>
                  </Td>
                </Tr>
              ))}
            </Table>
            <Pagination page={page} pages={pagination.pages} total={pagination.total} limit={pagination.limit} onPageChange={setPage} />
          </>
        )}
      </Card>
      <ConfirmDialog open={!!cancelTarget} onClose={() => setCancelTarget(null)} onConfirm={handleCancel} title="Cancel Booking" message={`Cancel booking "${cancelTarget?.booking_reference}" for ${cancelTarget?.passenger_name}? A refund will be initiated if payment was made.`} confirmLabel="Cancel Booking" loading={cancelling} />
    </div>
  );
};
