import React, { useState, useEffect, useCallback } from 'react';
import { refundsAPI } from '../services/api';
import { Card, Table, Tr, Td, Pagination, Button, StatusBadge, ErrorState, ConfirmDialog } from '../components/ui';
import { RefreshCw, CheckCircle, XCircle } from 'lucide-react';

interface FailedPaidRefundPageProps { onNotify: (msg: string, type?: any) => void; showFailed?: boolean; showPaid?: boolean; }

export const FailedPaidRefundPage: React.FC<FailedPaidRefundPageProps> = ({ onNotify, showFailed, showPaid }) => {
  const [refunds, setRefunds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, limit: 15 });
  const [retryTarget, setRetryTarget] = useState<any>(null);
  const [retrying, setRetrying] = useState(false);

  const fetch = useCallback(async () => {
    try {
      setLoading(true); setError('');
      let r;
      if (showFailed) r = await refundsAPI.failed({ page, limit: 15 });
      else if (showPaid) r = await refundsAPI.completed({ page, limit: 15 });
      else r = await refundsAPI.list({ page, limit: 15 });
      setRefunds(r.data.data);
      setPagination(r.data.pagination);
    } catch (e: any) { setError(e.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  }, [page, showFailed, showPaid]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleRetry = async () => {
    if (!retryTarget) return;
    setRetrying(true);
    try { await refundsAPI.retry(retryTarget.id); onNotify('Refund queued for retry'); setRetryTarget(null); fetch(); }
    catch (e: any) { onNotify(e.response?.data?.message || 'Retry failed', 'error'); }
    finally { setRetrying(false); }
  };

  const title = showFailed ? 'Failed Refunds' : showPaid ? 'Paid / Completed Refunds' : 'All Refunds';
  const HEADERS = ['Refund Ref', 'Booking', 'Passenger', 'Amount', 'Reason', 'Status', showFailed ? 'Actions' : ''].filter(Boolean);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h2 className="text-white font-semibold">{title}</h2><p className="text-slate-500 text-sm">{pagination.total} refunds</p></div>
      </div>
      <Card padding={false}>
        {error ? <ErrorState message={error} onRetry={fetch} /> : (
          <>
            <Table headers={HEADERS} loading={loading} empty={!loading && refunds.length === 0} emptyMessage={`No ${showFailed ? 'failed' : showPaid ? 'completed' : ''} refunds`}>
              {refunds.map((r) => (
                <Tr key={r.id}>
                  <Td><div className="text-white text-sm font-mono">{r.refund_reference}</div></Td>
                  <Td className="text-xs text-slate-300">{r.booking?.booking_reference || '—'}</Td>
                  <Td>
                    <div className="text-white text-sm">{r.passenger?.name || r.booking?.passenger_name || '—'}</div>
                    <div className="text-slate-500 text-xs">{r.passenger?.mobile || '—'}</div>
                  </Td>
                  <Td className="text-sm font-semibold" style={{ color: '#10b981' }}>₹{r.refund_amount}</Td>
                  <Td className="text-xs text-slate-400 max-w-[200px] truncate">{r.refund_reason || '—'}</Td>
                  <Td><StatusBadge status={r.status} /></Td>
                  {showFailed && (
                    <Td>
                      <div className="flex gap-1">
                        <Button variant="secondary" size="sm" onClick={() => setRetryTarget(r)}><RefreshCw size={12} />Retry</Button>
                      </div>
                    </Td>
                  )}
                </Tr>
              ))}
            </Table>
            <Pagination page={page} pages={pagination.pages} total={pagination.total} limit={pagination.limit} onPageChange={setPage} />
          </>
        )}
      </Card>
      <ConfirmDialog open={!!retryTarget} onClose={() => setRetryTarget(null)} onConfirm={handleRetry} title="Retry Refund" message={`Retry refund "${retryTarget?.refund_reference}" for ₹${retryTarget?.refund_amount}?`} confirmLabel="Retry" variant="warning" loading={retrying} />
    </div>
  );
};
