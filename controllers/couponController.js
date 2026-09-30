'use strict';

const { Op } = require('sequelize');
const { Coupon } = require('../models');

const buildPagination = (page, limit) => {
  const p = Math.max(1, parseInt(page) || 1);
  const l = Math.min(100, Math.max(1, parseInt(limit) || 15));
  return { offset: (p - 1) * l, limit: l, page: p };
};

exports.list = async (req, res, next) => {
  try {
    const { page, limit, search, status, code_type } = req.query;
    const { offset, limit: lim, page: p } = buildPagination(page, limit);
    const where = {};
    if (search) where[Op.or] = [{ code: { [Op.like]: `%${search}%` } }, { description: { [Op.like]: `%${search}%` } }];
    if (status) where.status = status;
    if (code_type) where.code_type = code_type;

    const { count, rows } = await Coupon.findAndCountAll({ where, offset, limit: lim, order: [['created_at', 'DESC']] });
    res.json({ success: true, data: rows, pagination: { total: count, page: p, limit: lim, pages: Math.ceil(count / lim) } });
  } catch (err) { next(err); }
};

exports.show = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByPk(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
    res.json({ success: true, data: coupon });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const exists = await Coupon.findOne({ where: { code: req.body.code } });
    if (exists) return res.status(409).json({ success: false, message: 'Coupon code already exists' });
    const coupon = await Coupon.create({ ...req.body, created_by: req.user?.id });
    res.status(201).json({ success: true, message: 'Coupon created', data: coupon });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByPk(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
    await coupon.update(req.body);
    res.json({ success: true, message: 'Coupon updated', data: coupon });
  } catch (err) { next(err); }
};

exports.destroy = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByPk(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
    await coupon.destroy();
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (err) { next(err); }
};

exports.validate = async (req, res, next) => {
  try {
    const { code, amount } = req.body;
    const coupon = await Coupon.findOne({ where: { code, status: 'Active' } });
    if (!coupon) return res.status(404).json({ success: false, message: 'Invalid coupon code' });
    if (coupon.end_date && new Date() > new Date(coupon.end_date)) return res.status(400).json({ success: false, message: 'Coupon has expired' });
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
    if (amount < coupon.min_amount) return res.status(400).json({ success: false, message: `Minimum order amount is ₹${coupon.min_amount}` });

    let discount = coupon.code_type === 'FLAT' ? parseFloat(coupon.amount) : (amount * parseFloat(coupon.amount)) / 100;
    if (coupon.max_discount) discount = Math.min(discount, parseFloat(coupon.max_discount));

    res.json({ success: true, message: 'Valid coupon', data: { coupon, discount: discount.toFixed(2), final_amount: (amount - discount).toFixed(2) } });
  } catch (err) { next(err); }
};
