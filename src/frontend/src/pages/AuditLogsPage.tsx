import React, { useState, useEffect, useCallback } from 'react';
import { dashboardAPI } from '../services/api';
import { Card, Table, Tr, Td, Pagination, SearchInput, StatusBadge, ErrorState, Select } from '../components/ui';
import { ClipboardList, Shield, User, Clock, Terminal } from 'lucide-react';

interface AuditLogsPageProps {
  onNotify: (msg: string, type?: any) => void;
}

export const AuditLogsPage: React.FC<AuditLogsPageProps> = ({ onNotify }) => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, limit: 20 });

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const resp = await dashboardAPI.auditLogs({
        page,
        limit: 20,
        search,
        action: actionFilter,
      });
      setLogs(resp.data.data || []);
      setPagination(resp.data.pagination || { total: 0, pages: 1, limit: 20 });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }, [page, search, actionFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    setPage(1);
  }, [search, actionFilter]);

  const HEADERS = ['ID', 'Action', 'Module / Entity', 'Performed By', 'IP Address', 'Details', 'Timestamp'];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Security & Audit Logs</h2>
          <p className="text-slate-400 text-sm">Trace administrative activities, modifications, and system events</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by action, details, user..."
        />
        <Select
          value={actionFilter}
          onChange={setActionFilter}
          options={[
            { value: 'CREATE', label: 'CREATE' },
            { value: 'UPDATE', label: 'UPDATE' },
            { value: 'DELETE', label: 'DELETE' },
            { value: 'LOGIN', label: 'LOGIN' },
            { value: 'CANCEL', label: 'CANCEL' },
            { value: 'REFUND', label: 'REFUND' },
          ]}
          placeholder="All Action Types"
        />
      </div>

      <Card padding={false}>
        {error ? (
          <ErrorState message={error} onRetry={fetchLogs} />
        ) : (
          <>
            <Table
              headers={HEADERS}
              loading={loading}
              empty={!loading && logs.length === 0}
              emptyMessage="No audit log entries recorded"
            >
              {logs.map((log) => (
                <Tr key={log.id}>
                  <Td>
                    <span className="font-mono text-slate-500 text-xs">#{log.id}</span>
                  </Td>
                  <Td>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      log.action?.includes('DELETE') ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                      log.action?.includes('CREATE') ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      log.action?.includes('UPDATE') ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      'bg-slate-700 text-slate-300'
                    }`}>
                      {log.action || 'ACTIVITY'}
                    </span>
                  </Td>
                  <Td>
                    <span className="text-white text-xs font-medium uppercase tracking-wider">
                      {log.entity || log.module || log.table_name || 'System'}
                    </span>
                    {log.entity_id && (
                      <span className="text-slate-500 text-xs font-mono ml-1">
                        (#{log.entity_id})
                      </span>
                    )}
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1.5 text-slate-300 text-xs">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      <span>{log.user?.name || log.performed_by || log.user_email || 'System'}</span>
                    </div>
                  </Td>
                  <Td className="font-mono text-xs text-slate-400">
                    {log.ip_address || '127.0.0.1'}
                  </Td>
                  <Td>
                    <div className="text-xs text-slate-300 max-w-sm truncate font-mono" title={typeof log.details === 'object' ? JSON.stringify(log.details) : log.details}>
                      {typeof log.details === 'object' ? JSON.stringify(log.details) : (log.details || log.description || '—')}
                    </div>
                  </Td>
                  <Td className="text-xs text-slate-400">
                    {log.created_at ? new Date(log.created_at).toLocaleString() : '—'}
                  </Td>
                </Tr>
              ))}
            </Table>
            <Pagination
              page={page}
              pages={pagination.pages}
              total={pagination.total}
              limit={pagination.limit}
              onPageChange={setPage}
            />
          </>
        )}
      </Card>
    </div>
  );
};
