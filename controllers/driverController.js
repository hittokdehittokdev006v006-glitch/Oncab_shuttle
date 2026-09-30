'use strict';

const { Op } = require('sequelize');
const { Driver, DriverDetail, Vehicle } = require('../models');
const { logAction } = require('../middleware/auditLog');

const buildPagination = (page, limit) => {
  const p = Math.max(1, parseInt(page) || 1);
  const l = Math.min(100, Math.max(1, parseInt(limit) || 15));
  return { offset: (p - 1) * l, limit: l, page: p };
};

// ── List Drivers ───────────────────────────────────────────
exports.list = async (req, res, next) => {
  try {
    const { page, limit, search, status, online_status, block_status } = req.query;
    const { offset, limit: lim, page: p } = buildPagination(page, limit);
    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { mobile: { [Op.like]: `%${search}%` } },
        { driver_user_id: { [Op.like]: `%${search}%` } },
      ];
    }
    if (status) where.status = status;
    if (online_status) where.online_status = online_status;
    if (block_status) where.block_status = block_status;

    const { count, rows } = await Driver.findAndCountAll({
      where,
      include: [{ model: DriverDetail, as: 'details' }, { model: Vehicle, as: 'vehicles' }],
      offset,
      limit: lim,
      order: [['created_at', 'DESC']],
    });

    res.json({ success: true, data: rows, pagination: { total: count, page: p, limit: lim, pages: Math.ceil(count / lim) } });
  } catch (err) {
    next(err);
  }
};

// ── Get Driver ─────────────────────────────────────────────
exports.show = async (req, res, next) => {
  try {
    const driver = await Driver.findByPk(req.params.id, {
      include: [{ model: DriverDetail, as: 'details' }, { model: Vehicle, as: 'vehicles' }],
    });
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });
    res.json({ success: true, data: driver });
  } catch (err) {
    next(err);
  }
};

// ── Create Driver ──────────────────────────────────────────
exports.create = async (req, res, next) => {
  try {
    const { name, email, mobile, aadhar, pan, sex, address, status, aadhar_img, pan_img, details } = req.body;
    const driver = await Driver.create({
      name,
      email,
      mobile,
      aadhar,
      pan,
      sex,
      address,
      status: status || 'Pending',
      created_by: req.user?.name,
    });

    const driverDetailsData = {
      ...(details || {}),
      driver_id: driver.id,
      aadhar: aadhar || (details && details.aadhar),
      aadhar_img: aadhar_img || (details && details.aadhar_img),
      smart_card_number: pan || (details && details.smart_card_number),
      smart_card_img: pan_img || (details && details.pan_img),
    };
    await DriverDetail.create(driverDetailsData);

    await logAction({ userId: req.user?.id, userType: req.user?.role?.name, userName: req.user?.name, action: 'create', module: 'drivers', entityType: 'Driver', entityId: driver.id, newValues: { name, mobile }, ipAddress: req.ip, description: `Created driver ${name}` });
    const created = await Driver.findByPk(driver.id, { include: [{ model: DriverDetail, as: 'details' }] });
    res.status(201).json({ success: true, message: 'Driver created', data: created });
  } catch (err) {
    next(err);
  }
};

// ── Update Driver ──────────────────────────────────────────
exports.update = async (req, res, next) => {
  try {
    const driver = await Driver.findByPk(req.params.id);
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });
    const { name, email, mobile, aadhar, pan, sex, address, status, block_status, online_status, aadhar_img, pan_img, details } = req.body;
    await driver.update({ name, email, mobile, aadhar, pan, sex, address, status, block_status, online_status });

    let existingDetail = await DriverDetail.findOne({ where: { driver_id: driver.id } });
    const detailPayload = {
      ...(details || {}),
      ...(aadhar ? { aadhar } : {}),
      ...(aadhar_img ? { aadhar_img } : {}),
      ...(pan ? { smart_card_number: pan } : {}),
      ...(pan_img ? { smart_card_img: pan_img } : {}),
    };

    if (existingDetail) {
      await existingDetail.update(detailPayload);
    } else {
      await DriverDetail.create({ ...detailPayload, driver_id: driver.id });
    }

    const updated = await Driver.findByPk(driver.id, { include: [{ model: DriverDetail, as: 'details' }] });
    res.json({ success: true, message: 'Driver updated', data: updated });
  } catch (err) {
    next(err);
  }
};

// ── Delete Driver ──────────────────────────────────────────
exports.destroy = async (req, res, next) => {
  try {
    const driver = await Driver.findByPk(req.params.id);
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });
    await driver.destroy();
    res.json({ success: true, message: 'Driver deleted' });
  } catch (err) {
    next(err);
  }
};

// ── Update Status ──────────────────────────────────────────
exports.updateStatus = async (req, res, next) => {
  try {
    const driver = await Driver.findByPk(req.params.id);
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });
    const { status, block_status, online_status } = req.body;
    await driver.update({ status, block_status, online_status });
    res.json({ success: true, message: 'Driver status updated', data: driver });
  } catch (err) {
    next(err);
  }
};
