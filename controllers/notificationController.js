'use strict';

const { Op } = require('sequelize');
const { Notification } = require('../models');

const buildPagination = (page, limit) => {
  const p = Math.max(1, parseInt(page) || 1);
  const l = Math.min(100, Math.max(1, parseInt(limit) || 15));
  return { offset: (p - 1) * l, limit: l, page: p };
};

exports.list = async (req, res, next) => {
  try {
    const { page, limit, read, type, target_type } = req.query;
    const { offset, limit: lim, page: p } = buildPagination(page, limit);
    const where = {};
    if (read === 'true') where.read_at = { [Op.ne]: null };
    if (read === 'false') where.read_at = null;
    if (type) where.type = type;
    if (target_type) where.target_type = target_type;

    const { count, rows } = await Notification.findAndCountAll({ where, offset, limit: lim, order: [['created_at', 'DESC']] });
    const unread = await Notification.count({ where: { read_at: null } });
    res.json({ success: true, data: rows, unread_count: unread, pagination: { total: count, page: p, limit: lim, pages: Math.ceil(count / lim) } });
  } catch (err) { next(err); }
};

exports.send = async (req, res, next) => {
  try {
    const { type, title, message, target_type, target_id, data, channel, notifiable_type, notifiable_id } = req.body;
    const notification = await Notification.create({ type, title, message, target_type, target_id, data, channel, notifiable_type, notifiable_id, sent_at: new Date() });
    res.status(201).json({ success: true, message: 'Notification sent', data: notification });
  } catch (err) { next(err); }
};

exports.markRead = async (req, res, next) => {
  try {
    await Notification.update({ read_at: new Date() }, { where: { id: req.params.id } });
    res.json({ success: true, message: 'Marked as read' });
  } catch (err) { next(err); }
};

exports.markAllRead = async (req, res, next) => {
  try {
    await Notification.update({ read_at: new Date() }, { where: { read_at: null } });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) { next(err); }
};

exports.destroy = async (req, res, next) => {
  try {
    await Notification.destroy({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Notification deleted' });
  } catch (err) { next(err); }
};
