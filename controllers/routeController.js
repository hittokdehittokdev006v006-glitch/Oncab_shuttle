'use strict';

const { Op } = require('sequelize');
const { Route, Stop } = require('../models');
const { logAction } = require('../middleware/auditLog');

const buildPagination = (page, limit) => {
  const p = Math.max(1, parseInt(page) || 1);
  const l = Math.min(100, Math.max(1, parseInt(limit) || 15));
  return { offset: (p - 1) * l, limit: l, page: p };
};

// ── List Routes ────────────────────────────────────────────
exports.list = async (req, res, next) => {
  try {
    const { page, limit, search, status } = req.query;
    const { offset, limit: lim, page: p } = buildPagination(page, limit);
    const where = {};
    if (search) where[Op.or] = [{ route_name: { [Op.like]: `%${search}%` } }, { route_code: { [Op.like]: `%${search}%` } }, { origin_city: { [Op.like]: `%${search}%` } }, { destination_city: { [Op.like]: `%${search}%` } }];
    if (status) where.status = status;

    const { count, rows } = await Route.findAndCountAll({
      where,
      include: [{ model: Stop, as: 'stops', order: [['stop_sequence', 'ASC']] }],
      offset, limit: lim,
      order: [['created_at', 'DESC']],
    });
    res.json({ success: true, data: rows, pagination: { total: count, page: p, limit: lim, pages: Math.ceil(count / lim) } });
  } catch (err) {
    next(err);
  }
};

// ── Get Route ──────────────────────────────────────────────
exports.show = async (req, res, next) => {
  try {
    const route = await Route.findByPk(req.params.id, {
      include: [{ model: Stop, as: 'stops', order: [['stop_sequence', 'ASC']] }],
    });
    if (!route) return res.status(404).json({ success: false, message: 'Route not found' });
    res.json({ success: true, data: route });
  } catch (err) {
    next(err);
  }
};

// ── Create Route ───────────────────────────────────────────
exports.create = async (req, res, next) => {
  try {
    const { route_name, route_code, origin_city, destination_city, total_distance, estimated_duration, description, stops } = req.body;
    const exists = await Route.findOne({ where: { route_code } });
    if (exists) return res.status(409).json({ success: false, message: 'Route code already exists' });

    const route = await Route.create({ route_name, route_code, origin_city, destination_city, total_distance, estimated_duration, description });

    if (stops?.length) {
      const stopsData = stops.map((s, i) => ({ ...s, route_id: route.id, stop_sequence: s.stop_sequence ?? i + 1 }));
      await Stop.bulkCreate(stopsData);
    }

    await logAction({ userId: req.user?.id, userType: req.user?.role?.name, userName: req.user?.name, action: 'create', module: 'routes', entityType: 'Route', entityId: route.id, newValues: { route_name, route_code }, ipAddress: req.ip, description: `Created route ${route_name}` });

    const created = await Route.findByPk(route.id, { include: [{ model: Stop, as: 'stops' }] });
    res.status(201).json({ success: true, message: 'Route created', data: created });
  } catch (err) {
    next(err);
  }
};

// ── Update Route ───────────────────────────────────────────
exports.update = async (req, res, next) => {
  try {
    const route = await Route.findByPk(req.params.id);
    if (!route) return res.status(404).json({ success: false, message: 'Route not found' });
    await route.update(req.body);
    res.json({ success: true, message: 'Route updated', data: route });
  } catch (err) {
    next(err);
  }
};

// ── Delete Route ───────────────────────────────────────────
exports.destroy = async (req, res, next) => {
  try {
    const route = await Route.findByPk(req.params.id);
    if (!route) return res.status(404).json({ success: false, message: 'Route not found' });
    await route.destroy();
    res.json({ success: true, message: 'Route deleted' });
  } catch (err) {
    next(err);
  }
};

// ── Stops CRUD ─────────────────────────────────────────────
exports.addStop = async (req, res, next) => {
  try {
    const route = await Route.findByPk(req.params.id);
    if (!route) return res.status(404).json({ success: false, message: 'Route not found' });
    const stop = await Stop.create({ ...req.body, route_id: route.id });
    res.status(201).json({ success: true, message: 'Stop added', data: stop });
  } catch (err) {
    next(err);
  }
};

exports.updateStop = async (req, res, next) => {
  try {
    const stop = await Stop.findByPk(req.params.stopId);
    if (!stop) return res.status(404).json({ success: false, message: 'Stop not found' });
    await stop.update(req.body);
    res.json({ success: true, message: 'Stop updated', data: stop });
  } catch (err) {
    next(err);
  }
};

exports.deleteStop = async (req, res, next) => {
  try {
    const stop = await Stop.findByPk(req.params.stopId);
    if (!stop) return res.status(404).json({ success: false, message: 'Stop not found' });
    await stop.destroy();
    res.json({ success: true, message: 'Stop deleted' });
  } catch (err) {
    next(err);
  }
};
