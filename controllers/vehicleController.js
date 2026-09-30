'use strict';

const { Op } = require('sequelize');
const { Vehicle, VehicleDocument, Driver, BusType } = require('../models');
const { logAction } = require('../middleware/auditLog');

const buildPagination = (page, limit) => {
  const p = Math.max(1, parseInt(page) || 1);
  const l = Math.min(100, Math.max(1, parseInt(limit) || 15));
  return { offset: (p - 1) * l, limit: l, page: p };
};

// ── List Vehicles ──────────────────────────────────────────
exports.list = async (req, res, next) => {
  try {
    const { page, limit, search, status } = req.query;
    const { offset, limit: lim, page: p } = buildPagination(page, limit);
    const where = {};
    if (search) {
      where[Op.or] = [
        { registration_number: { [Op.like]: `%${search}%` } },
        { company_model: { [Op.like]: `%${search}%` } },
      ];
    }
    if (status) where.status = status;

    const { count, rows } = await Vehicle.findAndCountAll({
      where,
      include: [
        { model: Driver, as: 'driver', attributes: ['id', 'name', 'mobile'] },
        { model: BusType, as: 'bus_type', attributes: ['id', 'name', 'code'] },
        { model: VehicleDocument, as: 'documents' },
      ],
      offset, limit: lim,
      order: [['created_at', 'DESC']],
    });

    res.json({ success: true, data: rows, pagination: { total: count, page: p, limit: lim, pages: Math.ceil(count / lim) } });
  } catch (err) {
    next(err);
  }
};

// ── Get Vehicle ────────────────────────────────────────────
exports.show = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id, {
      include: [
        { model: Driver, as: 'driver' },
        { model: BusType, as: 'bus_type' },
        { model: VehicleDocument, as: 'documents' },
      ],
    });
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
    res.json({ success: true, data: vehicle });
  } catch (err) {
    next(err);
  }
};

// ── Create Vehicle ─────────────────────────────────────────
exports.create = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.create(req.body);
    await logAction({ userId: req.user?.id, userType: req.user?.role?.name, userName: req.user?.name, action: 'create', module: 'vehicles', entityType: 'Vehicle', entityId: vehicle.id, newValues: req.body, ipAddress: req.ip, description: `Created vehicle ${vehicle.registration_number}` });
    res.status(201).json({ success: true, message: 'Vehicle created', data: vehicle });
  } catch (err) {
    next(err);
  }
};

// ── Update Vehicle ─────────────────────────────────────────
exports.update = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
    await vehicle.update(req.body);
    res.json({ success: true, message: 'Vehicle updated', data: vehicle });
  } catch (err) {
    next(err);
  }
};

// ── Delete Vehicle ─────────────────────────────────────────
exports.destroy = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
    await vehicle.destroy();
    res.json({ success: true, message: 'Vehicle deleted' });
  } catch (err) {
    next(err);
  }
};

// ── Add Document ───────────────────────────────────────────
exports.addDocument = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
    const doc = await VehicleDocument.create({ ...req.body, vehicle_id: vehicle.id });
    res.status(201).json({ success: true, message: 'Document added', data: doc });
  } catch (err) {
    next(err);
  }
};

// ── Expiring Documents ─────────────────────────────────────
exports.expiringDocuments = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const threshold = new Date();
    threshold.setDate(threshold.getDate() + parseInt(days));
    const docs = await VehicleDocument.findAll({
      where: { expiry_date: { [Op.between]: [new Date(), threshold] } },
      include: [{ model: Vehicle, as: 'vehicle', attributes: ['id', 'registration_number', 'company_model'] }],
      order: [['expiry_date', 'ASC']],
    });
    res.json({ success: true, data: docs });
  } catch (err) {
    next(err);
  }
};

// ── List Bus Types ─────────────────────────────────────────
exports.listBusTypes = async (req, res, next) => {
  try {
    const busTypes = await BusType.findAll({
      where: { status: 'Active' },
      order: [['name', 'ASC']],
    });
    res.json({ success: true, data: busTypes });
  } catch (err) {
    next(err);
  }
};
