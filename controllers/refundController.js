'use strict';

const { Op } = require('sequelize');
const { Refund, Booking, Payment, Passenger } = require('../models');
const { logAction } = require('../middleware/auditLog');

const buildPagination = (page, limit) => {
  const p = Math.max(1, parseInt(page) || 1);
  const l = Math.min(100, Math.max(1, parseInt(limit) || 15));
  return { offset: (p - 1) * l, limit: l, page: p };
};

const REFUND_INCLUDE = [
  { model: Booking, as: 'booking', attributes: ['id', 'booking_reference', 'passenger_name', 'travel_date'] },
  { model: Passenger, as: 'passenger', attributes: ['id', 'name', 'mobile', 'email'] },
];

// ── List All Refunds ───────────────────────────────────────
exports.list = async (req, res, next) => {
  try {
    const { page, limit, status, search } = req.query;
    const { offset, limit: lim, page: p } = buildPagination(page, limit);
    const where = {};
    if (status) where.status = status;
    if (search) where[Op.or] = [{ refund_reference: { [Op.like]: `%${search}%` } }];

    const { count, rows } = await Refund.findAndCountAll({ where, include: REFUND_INCLUDE, offset, limit: lim, order: [['created_at', 'DESC']] });
    res.json({ success: true, data: rows, pagination: { total: count, page: p, limit: lim, pages: Math.ceil(count / lim) } });
  } catch (err) {
    next(err);
  }
};

// ── Failed Refunds ─────────────────────────────────────────
exports.failedList = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const { offset, limit: lim, page: p } = buildPagination(page, limit);
    const { count, rows } = await Refund.findAndCountAll({ where: { status: 'failed' }, include: REFUND_INCLUDE, offset, limit: lim, order: [['created_at', 'DESC']] });
    res.json({ success: true, data: rows, pagination: { total: count, page: p, limit: lim, pages: Math.ceil(count / lim) } });
  } catch (err) {
    next(err);
  }
};

// ── Completed/Paid Refunds ─────────────────────────────────
exports.completedList = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const { offset, limit: lim, page: p } = buildPagination(page, limit);
    const { count, rows } = await Refund.findAndCountAll({ where: { status: 'completed' }, include: REFUND_INCLUDE, offset, limit: lim, order: [['processed_at', 'DESC']] });
    res.json({ success: true, data: rows, pagination: { total: count, page: p, limit: lim, pages: Math.ceil(count / lim) } });
  } catch (err) {
    next(err);
  }
};

// ── Process Refund ─────────────────────────────────────────
exports.process = async (req, res, next) => {
  try {
    const refund = await Refund.findByPk(req.params.id, { include: REFUND_INCLUDE });
    if (!refund) return res.status(404).json({ success: false, message: 'Refund not found' });
    if (refund.status === 'completed') return res.status(400).json({ success: false, message: 'Refund already processed' });

    const { gateway_refund_id, notes } = req.body;
    await refund.update({ status: 'completed', gateway_refund_id, notes, processed_at: new Date() });

    await logAction({ userId: req.user?.id, userType: req.user?.role?.name, userName: req.user?.name, action: 'process_refund', module: 'refunds', entityType: 'Refund', entityId: refund.id, newValues: { status: 'completed', gateway_refund_id }, ipAddress: req.ip, description: `Processed refund ${refund.refund_reference}` });

    res.json({ success: true, message: 'Refund processed', data: refund });
  } catch (err) {
    next(err);
  }
};

// ── Retry Failed Refund ────────────────────────────────────
exports.retry = async (req, res, next) => {
  try {
    const refund = await Refund.findByPk(req.params.id);
    if (!refund) return res.status(404).json({ success: false, message: 'Refund not found' });
    if (refund.status !== 'failed') return res.status(400).json({ success: false, message: 'Only failed refunds can be retried' });
    await refund.update({ status: 'pending', retry_count: refund.retry_count + 1, failure_reason: null });
    res.json({ success: true, message: 'Refund queued for retry', data: refund });
  } catch (err) {
    next(err);
  }
};

// ── Mark Refund Failed ─────────────────────────────────────
exports.markFailed = async (req, res, next) => {
  try {
    const refund = await Refund.findByPk(req.params.id);
    if (!refund) return res.status(404).json({ success: false, message: 'Refund not found' });
    const { failure_reason } = req.body;
    await refund.update({ status: 'failed', failure_reason });
    res.json({ success: true, message: 'Refund marked as failed', data: refund });
  } catch (err) {
    next(err);
  }
};
