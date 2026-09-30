import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, FileText, AlertTriangle, Upload, FilePlus, Calendar, Eye, X } from 'lucide-react';
import { vehiclesAPI } from '../services/api';
import { Card, Table, Tr, Td, Pagination, SearchInput, Button, Select, StatusBadge, Modal, Input, ConfirmDialog, ErrorState, Badge } from '../components/ui';

interface Vehicle {
  id: number;
  registration_number: string;
  company_model: string;
  engine_type: string;
  color: string;
  total_seats: number;
  status: string;
  driver?: { name: string };
  bus_type?: { name: string };
  documents?: any[];
  created_at: string;
}

interface VehiclesPageProps {
  onNotify: (msg: string, type?: any) => void;
  showDocs?: boolean;
}

const HEADERS = ['Vehicle', 'Engine / Color', 'Bus Type', 'Driver', 'Seats', 'Documents', 'Status', 'Actions'];
const DOC_HEADERS = ['Vehicle', 'Doc Type', 'Doc Number', 'Issue Date', 'Expiry Date', 'Status', 'Notes'];

export const VehiclesPage: React.FC<VehiclesPageProps> = ({ onNotify, showDocs }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, limit: 15 });

  // Vehicle modal
  const [showModal, setShowModal] = useState(false);
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Vehicle | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    registration_number: '',
    company_model: '',
    engine_type: '',
    color: '',
    total_seats: '24',
    status: 'Active',
  });

  // Document modal & detail
  const [showDocModal, setShowDocModal] = useState(false);
  const [selectedVehicleForDocs, setSelectedVehicleForDocs] = useState<Vehicle | null>(null);
  const [savingDoc, setSavingDoc] = useState(false);
  const [docForm, setDocForm] = useState({
    vehicle_id: '',
    doc_type: 'insurance',
    doc_number: '',
    issue_date: '',
    expiry_date: '',
    status: 'Valid',
    notes: '',
  });

  const [expiringDocs, setExpiringDocs] = useState<any[]>([]);

  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const resp = await vehiclesAPI.list({ page, limit: 15, search, status: statusFilter });
      setVehicles(resp.data.data || []);
      setPagination(resp.data.pagination || { total: 0, pages: 1, limit: 15 });

      if (showDocs) {
        const docsResp = await vehiclesAPI.expiringDocs(90);
        setExpiringDocs(docsResp.data.data || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, showDocs]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const openCreate = () => {
    setEditVehicle(null);
    setForm({
      registration_number: '',
      company_model: '',
      engine_type: 'electric',
      color: 'blue',
      total_seats: '24',
      status: 'Active',
    });
    setShowModal(true);
  };

  const openEdit = (v: Vehicle) => {
    setEditVehicle(v);
    setForm({
      registration_number: v.registration_number,
      company_model: v.company_model || '',
      engine_type: v.engine_type || '',
      color: v.color || '',
      total_seats: String(v.total_seats || 24),
      status: v.status || 'Active',
    });
    setShowModal(true);
  };

  const openAddDocument = (vehicle?: Vehicle) => {
    const targetId = vehicle?.id ? String(vehicle.id) : (vehicles[0]?.id ? String(vehicles[0].id) : '');
    setDocForm({
      vehicle_id: targetId,
      doc_type: 'insurance',
      doc_number: '',
      issue_date: new Date().toISOString().split('T')[0],
      expiry_date: '',
      status: 'Valid',
      notes: '',
    });
    setShowDocModal(true);
  };

  const handleSaveVehicle = async () => {
    if (!form.registration_number) {
      onNotify('Registration number is required', 'error');
      return;
    }
    setSaving(true);
    try {
      if (editVehicle) {
        await vehiclesAPI.update(editVehicle.id, form);
        onNotify('Vehicle updated successfully');
      } else {
        await vehiclesAPI.create(form);
        onNotify('Vehicle created successfully');
      }
      setShowModal(false);
      fetchVehicles();
    } catch (err: any) {
      onNotify(err.response?.data?.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docForm.vehicle_id) {
      onNotify('Please select a vehicle', 'error');
      return;
    }
    if (!docForm.doc_number) {
      onNotify('Document number is required', 'error');
      return;
    }

    setSavingDoc(true);
    try {
      await vehiclesAPI.addDocument(parseInt(docForm.vehicle_id), {
        doc_type: docForm.doc_type,
        doc_number: docForm.doc_number,
        issue_date: docForm.issue_date || null,
        expiry_date: docForm.expiry_date || null,
        status: docForm.status,
        notes: docForm.notes || null,
      });
      onNotify('Vehicle document uploaded successfully!');
      setShowDocModal(false);
      fetchVehicles();
    } catch (err: any) {
      onNotify(err.response?.data?.message || 'Failed to add document', 'error');
    } finally {
      setSavingDoc(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await vehiclesAPI.delete(deleteTarget.id);
      onNotify('Vehicle deleted');
      setDeleteTarget(null);
      fetchVehicles();
    } catch (err: any) {
      onNotify(err.response?.data?.message || 'Delete failed', 'error');
    } finally {
      setDeleting(false);
    }
  };

  // If showing standalone "Vehicle Documents" view
  if (showDocs) {
    return (
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Vehicle Documents & Compliance</h2>
            <p className="text-slate-400 text-sm">Track insurance, fitness certificates, permits, and expiry renewals</p>
          </div>
          <Button onClick={() => openAddDocument()} icon={FilePlus}>
            + Add Document
          </Button>
        </div>

        {expiringDocs.length > 0 && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <AlertTriangle size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-300 font-semibold text-sm">
                {expiringDocs.length} document(s) expiring within 90 days
              </p>
              <p className="text-amber-400/80 text-xs mt-0.5">
                Renew these documents promptly with local transport authorities to avoid compliance interruptions.
              </p>
            </div>
          </div>
        )}

        <Card padding={false}>
          <Table
            headers={DOC_HEADERS}
            loading={loading}
            empty={!loading && expiringDocs.length === 0}
            emptyMessage="No documents expiring within the next 90 days"
          >
            {expiringDocs.map((doc: any) => (
              <Tr key={doc.id}>
                <Td>
                  <div className="text-white text-sm font-medium font-mono">
                    {doc.vehicle?.registration_number}
                  </div>
                  <div className="text-slate-500 text-xs">{doc.vehicle?.company_model || '—'}</div>
                </Td>
                <Td className="capitalize font-medium text-slate-200">
                  <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-xs">
                    {doc.doc_type}
                  </span>
                </Td>
                <Td className="font-mono text-xs text-cyan-400">{doc.doc_number || '—'}</Td>
                <Td className="text-xs text-slate-400">{doc.issue_date || '—'}</Td>
                <Td>
                  <span
                    className={`font-mono text-xs font-semibold ${
                      new Date(doc.expiry_date) < new Date() ? 'text-rose-400' : 'text-amber-400'
                    }`}
                  >
                    {doc.expiry_date ? new Date(doc.expiry_date).toLocaleDateString() : '—'}
                  </span>
                </Td>
                <Td>
                  <StatusBadge status={doc.status} />
                </Td>
                <Td className="text-xs text-slate-400">{doc.notes || '—'}</Td>
              </Tr>
            ))}
          </Table>
        </Card>

        {/* Add Document Modal Reuse */}
        {showDocModal && renderDocModal()}
      </div>
    );
  }

  function renderDocModal() {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
        <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl p-6 my-8">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <h3 className="text-lg font-semibold text-white">Add Vehicle Document</h3>
            <button
              onClick={() => setShowDocModal(false)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSaveDocument} className="space-y-4 pt-4">
            {/* Target Vehicle */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Select Vehicle <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={docForm.vehicle_id}
                onChange={(e) => setDocForm({ ...docForm, vehicle_id: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="">Select a Vehicle</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.registration_number} ({v.company_model || 'Bus'})
                  </option>
                ))}
              </select>
            </div>

            {/* Document Type & Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Document Type <span className="text-rose-500">*</span>
                </label>
                <select
                  value={docForm.doc_type}
                  onChange={(e) => setDocForm({ ...docForm, doc_type: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="insurance">Insurance Policy</option>
                  <option value="fitness">Fitness Certificate</option>
                  <option value="pollution">Pollution Under Control (PUC)</option>
                  <option value="registration">Registration Certificate (RC)</option>
                  <option value="permit">Commercial Route Permit</option>
                  <option value="other">Other Compliance Doc</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Document / Policy No. <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., POL-88992-X"
                  value={docForm.doc_number}
                  onChange={(e) => setDocForm({ ...docForm, doc_number: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>

            {/* Issue Date & Expiry Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Issue Date</label>
                <input
                  type="date"
                  value={docForm.issue_date}
                  onChange={(e) => setDocForm({ ...docForm, issue_date: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Expiry Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={docForm.expiry_date}
                  onChange={(e) => setDocForm({ ...docForm, expiry_date: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Document Status */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Status</label>
              <select
                value={docForm.status}
                onChange={(e) => setDocForm({ ...docForm, status: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Valid">Valid</option>
                <option value="Expiring Soon">Expiring Soon</option>
                <option value="Expired">Expired</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Notes / Authority</label>
              <input
                type="text"
                placeholder="Issued by National Insurance / RTO Kolkata..."
                value={docForm.notes}
                onChange={(e) => setDocForm({ ...docForm, notes: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <Button variant="ghost" type="button" onClick={() => setShowDocModal(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={savingDoc} icon={Upload}>
                Save Document
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Vehicle Management</h2>
          <p className="text-slate-400 text-sm">{pagination.total} vehicles registered</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => openAddDocument()} icon={FilePlus}>
            + Add Document
          </Button>
          <Button onClick={openCreate} icon={Plus}>
            Add Vehicle
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search reg. number or model..."
        />
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: 'Active', label: 'Active' },
            { value: 'Inactive', label: 'Inactive' },
            { value: 'Under Maintenance', label: 'Under Maintenance' },
          ]}
          placeholder="All Statuses"
        />
      </div>

      {/* Selected Vehicle Documents Panel */}
      {selectedVehicleForDocs && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-medium">
                {selectedVehicleForDocs.registration_number} — Documents
              </h3>
              <p className="text-slate-400 text-xs">
                {selectedVehicleForDocs.company_model || 'Bus'} ({selectedVehicleForDocs.total_seats} seats)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => openAddDocument(selectedVehicleForDocs)}
                icon={FilePlus}
              >
                Add Document
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setSelectedVehicleForDocs(null)}>
                Close
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            {(selectedVehicleForDocs.documents || []).length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {selectedVehicleForDocs.documents?.map((doc: any) => (
                  <div
                    key={doc.id}
                    className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 flex flex-col justify-between gap-2"
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-xs uppercase font-semibold text-indigo-400">
                        {doc.doc_type}
                      </span>
                      <StatusBadge status={doc.status} />
                    </div>
                    <div className="font-mono text-sm text-white font-medium">
                      {doc.doc_number || 'No Number'}
                    </div>
                    <div className="text-xs text-slate-400 flex items-center justify-between pt-1 border-t border-slate-700/50">
                      <span>Expires:</span>
                      <span
                        className={
                          new Date(doc.expiry_date) < new Date() ? 'text-rose-400 font-bold' : 'text-slate-200'
                        }
                      >
                        {doc.expiry_date || '—'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-slate-500 text-sm">
                No documents uploaded yet for this vehicle.{' '}
                <button
                  onClick={() => openAddDocument(selectedVehicleForDocs)}
                  className="text-indigo-400 underline ml-1"
                >
                  Upload now
                </button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Main Vehicles Table */}
      <Card padding={false}>
        {error ? (
          <ErrorState message={error} onRetry={fetchVehicles} />
        ) : (
          <>
            <Table
              headers={HEADERS}
              loading={loading}
              empty={!loading && vehicles.length === 0}
              emptyMessage="No vehicles found"
            >
              {vehicles.map((v) => (
                <Tr key={v.id}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(99, 102, 241, 0.1)' }}
                      >
                        <FileText size={14} style={{ color: '#818cf8' }} />
                      </div>
                      <div>
                        <div className="text-white font-medium text-sm font-mono">{v.registration_number}</div>
                        <div className="text-slate-500 text-xs">{v.company_model || '—'}</div>
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <div className="text-xs text-slate-300 capitalize">{v.engine_type || '—'}</div>
                    <div className="text-xs text-slate-500 capitalize">{v.color || '—'}</div>
                  </Td>
                  <Td className="text-xs text-slate-300">{v.bus_type?.name || 'Standard Bus'}</Td>
                  <Td className="text-xs text-slate-300">{v.driver?.name || 'Unassigned'}</Td>
                  <Td>
                    <Badge color="blue">{v.total_seats} seats</Badge>
                  </Td>
                  <Td>
                    <button
                      onClick={() => setSelectedVehicleForDocs(v)}
                      className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                      title="View & Add documents"
                    >
                      <FileText size={13} />
                      <span>{v.documents?.length || 0} Docs</span>
                    </button>
                  </Td>
                  <Td>
                    <StatusBadge status={v.status} />
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openAddDocument(v)}
                        title="Upload document"
                      >
                        <FilePlus size={14} className="text-indigo-400" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(v)}>
                        <Edit2 size={13} className="text-slate-300" />
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => setDeleteTarget(v)}>
                        <Trash2 size={13} />
                      </Button>
                    </div>
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

      {/* Add / Edit Vehicle Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editVehicle ? 'Edit Vehicle' : 'Add Vehicle'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveVehicle} loading={saving}>
              {editVehicle ? 'Update' : 'Create'}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Registration Number"
            value={form.registration_number}
            onChange={(v) => setForm({ ...form, registration_number: v })}
            placeholder="WB 04 G 8812"
            required
            className="col-span-2 font-mono"
          />
          <Input
            label="Model"
            value={form.company_model}
            onChange={(v) => setForm({ ...form, company_model: v })}
            placeholder="Volvo 9400 EV"
          />
          <Input
            label="Engine Type"
            value={form.engine_type}
            onChange={(v) => setForm({ ...form, engine_type: v })}
            placeholder="Electric / CNG / Diesel"
          />
          <Input
            label="Color"
            value={form.color}
            onChange={(v) => setForm({ ...form, color: v })}
            placeholder="Midnight Blue"
          />
          <Input
            label="Total Seats"
            type="number"
            value={form.total_seats}
            onChange={(v) => setForm({ ...form, total_seats: v })}
            placeholder="24"
          />
        </div>
      </Modal>

      {/* Add Document Modal */}
      {showDocModal && renderDocModal()}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Vehicle"
        message={`Delete vehicle "${deleteTarget?.registration_number}"?`}
        loading={deleting}
      />
    </div>
  );
};
