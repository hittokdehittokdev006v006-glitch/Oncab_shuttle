'use strict';

const { Op } = require('sequelize');
const { Passenger, Booking, Pass } = require('../models');

const buildPagination = (page, limit) => {
  const p = Math.max(1, parseInt(page) || 1);
  const l = Math.min(100, Math.max(1, parseInt(limit) || 15));
  return { offset: (p - 1) * l, limit: l, page: p };
};

exports.list = async (req, res, next) => {
  try {
    const { page, limit, search, status, block_status } = req.query;
    const { offset, limit: lim, page: p } = buildPagination(page, limit);
    const where = {};
    if (search) where[Op.or] = [{ name: { [Op.like]: `%${search}%` } }, { mobile: { [Op.like]: `%${search}%` } }, { email: { [Op.like]: `%${search}%` } }];
    if (status) where.status = status;
    if (block_status) where.block_status = block_status;

    const { count, rows } = await Passenger.findAndCountAll({ where, offset, limit: lim, order: [['created_at', 'DESC']] });
    res.json({ success: true, data: rows, pagination: { total: count, page: p, limit: lim, pages: Math.ceil(count / lim) } });
  } catch (err) { next(err); }
};

exports.show = async (req, res, next) => {
  try {
    const passenger = await Passenger.findByPk(req.params.id, { include: [{ model: Booking, as: 'bookings', limit: 10, order: [['created_at', 'DESC']] }, { model: Pass, as: 'passes' }] });
    if (!passenger) return res.status(404).json({ success: false, message: 'Passenger not found' });
    res.json({ success: true, data: passenger });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const passenger = await Passenger.create(req.body);
    res.status(201).json({ success: true, message: 'Passenger created', data: passenger });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const passenger = await Passenger.findByPk(req.params.id);
    if (!passenger) return res.status(404).json({ success: false, message: 'Passenger not found' });
    await passenger.update(req.body);
    res.json({ success: true, message: 'Passenger updated', data: passenger });
  } catch (err) { next(err); }
};

exports.destroy = async (req, res, next) => {
  try {
    const passenger = await Passenger.findByPk(req.params.id);
    if (!passenger) return res.status(404).json({ success: false, message: 'Passenger not found' });
    await passenger.destroy();
    res.json({ success: true, message: 'Passenger deleted' });
  } catch (err) { next(err); }
};

exports.toggleBlock = async (req, res, next) => {
  try {
    const passenger = await Passenger.findByPk(req.params.id);
    if (!passenger) return res.status(404).json({ success: false, message: 'Passenger not found' });
    const newStatus = passenger.block_status === 'Block' ? 'Unblock' : 'Block';
    await passenger.update({ block_status: newStatus });
    res.json({ success: true, message: `Passenger ${newStatus === 'Block' ? 'blocked' : 'unblocked'}`, data: { block_status: newStatus } });
  } catch (err) { next(err); }
};
