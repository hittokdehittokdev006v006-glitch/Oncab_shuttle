'use strict';

const { Op } = require('sequelize');
const { Pass, Passenger, Route } = require('../models');

const buildPagination = (page, limit) => {
  const p = Math.max(1, parseInt(page) || 1);
  const l = Math.min(100, Math.max(1, parseInt(limit) || 15));
  return { offset: (p - 1) * l, limit: l, page: p };
};

const PASS_INCLUDE = [
  { model: Passenger, as: 'passenger', attributes: ['id', 'name', 'mobile', 'email'] },
  { model: Route, as: 'route', attributes: ['id', 'route_name', 'route_code'] },
];

exports.list = async (req, res, next) => {
  try {
    const { page, limit, search, status, pass_type } = req.query;
    const { offset, limit: lim, page: p } = buildPagination(page, limit);
    const where = {};
    if (search) where.pass_code = { [Op.like]: `%${search}%` };
    if (status) where.status = status;
    if (pass_type) where.pass_type = pass_type;

    const { count, rows } = await Pass.findAndCountAll({ where, include: PASS_INCLUDE, offset, limit: lim, order: [['created_at', 'DESC']] });
    res.json({ success: true, data: rows, pagination: { total: count, page: p, limit: lim, pages: Math.ceil(count / lim) } });
  } catch (err) { next(err); }
};

exports.show = async (req, res, next) => {
  try {
    const pass = await Pass.findByPk(req.params.id, { include: PASS_INCLUDE });
    if (!pass) return res.status(404).json({ success: false, message: 'Pass not found' });
    res.json({ success: true, data: pass });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const pass_code = `PASS-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const pass = await Pass.create({ ...req.body, pass_code });
    const created = await Pass.findByPk(pass.id, { include: PASS_INCLUDE });
    res.status(201).json({ success: true, message: 'Pass created', data: created });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const pass = await Pass.findByPk(req.params.id);
    if (!pass) return res.status(404).json({ success: false, message: 'Pass not found' });
    await pass.update(req.body);
    res.json({ success: true, message: 'Pass updated', data: pass });
  } catch (err) { next(err); }
};

exports.destroy = async (req, res, next) => {
  try {
    const pass = await Pass.findByPk(req.params.id);
    if (!pass) return res.status(404).json({ success: false, message: 'Pass not found' });
    await pass.destroy();
    res.json({ success: true, message: 'Pass deleted' });
  } catch (err) { next(err); }
};

exports.expiringSoon = async (req, res, next) => {
  try {
    const { days = 7 } = req.query;
    const threshold = new Date();
    threshold.setDate(threshold.getDate() + parseInt(days));
    const passes = await Pass.findAll({
      where: { valid_until: { [Op.between]: [new Date(), threshold] }, status: 'Active' },
      include: PASS_INCLUDE,
      order: [['valid_until', 'ASC']],
    });
    res.json({ success: true, data: passes });
  } catch (err) { next(err); }
};
