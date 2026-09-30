'use strict';

const { SystemSetting } = require('../models');

exports.list = async (req, res, next) => {
  try {
    const { group } = req.query;
    const where = group ? { group } : {};
    const settings = await SystemSetting.findAll({ where, order: [['group', 'ASC'], ['key', 'ASC']] });
    const grouped = settings.reduce((acc, s) => { if (!acc[s.group]) acc[s.group] = []; acc[s.group].push(s); return acc; }, {});
    res.json({ success: true, data: { settings, grouped } });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const { key, value, label, description, group, type, is_public } = req.body;
    const [setting, created] = await SystemSetting.upsert({ key, value, label, description, group, type, is_public });
    res.json({ success: true, message: created ? 'Setting created' : 'Setting updated', data: setting });
  } catch (err) { next(err); }
};

exports.bulkUpdate = async (req, res, next) => {
  try {
    const { settings } = req.body;
    await Promise.all(settings.map(s => SystemSetting.upsert(s)));
    res.json({ success: true, message: 'Settings saved' });
  } catch (err) { next(err); }
};

exports.get = async (req, res, next) => {
  try {
    const setting = await SystemSetting.findOne({ where: { key: req.params.key } });
    if (!setting) return res.status(404).json({ success: false, message: 'Setting not found' });
    res.json({ success: true, data: setting });
  } catch (err) { next(err); }
};
