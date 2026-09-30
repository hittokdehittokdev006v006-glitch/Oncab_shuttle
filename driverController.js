'use strict';

const { Op } = require('sequelize');
const { Driver, DriverDetail, Vehicle } = require('../models');
const { logAction } = require('../middleware/auditLog');
const {
    UPLOAD_ROOT,
    ensureDirectory,
    saveBase64File,
    deleteFile,
    replaceFile,
    deleteFolder,
    getImageUrl
} = require('../utils/fileUpload');

const buildPagination = (page, limit) => {
  const p = Math.max(1, parseInt(page) || 1);
  const l = Math.min(100, Math.max(1, parseInt(limit) || 15));
  return { offset: (p - 1) * l, limit: l, page: p };
};

// ── List Drivers ───────────────────────────────────────────
exports.list = async (req, res, next) => {
  try {
   const {
            page,
            limit,
            search,
            status,
            online_status,
            block_status
        } = req.query;

        const {
            offset,
            limit: lim,
            page: p
        } = buildPagination(page, limit);

        const where = {};

        if (search) {
            where[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
                { mobile: { [Op.like]: `%${search}%` } },
                { driver_user_id: { [Op.like]: `%${search}%` } },
            ];
        }

        if (status) {
            where.status = status;
        }

        if (online_status) {
            where.online_status = online_status;
        }

        if (block_status) {
            where.block_status = block_status;
        }

        const {
            count,
            rows
        } = await Driver.findAndCountAll({
            where,
            include: [
                {
                    model: DriverDetail,
                    as: 'details'
                },
                {
                    model: Vehicle,
                    as: 'vehicles'
                }
            ],
            offset,
            limit: lim,
            order: [['created_at', 'DESC']],
        });

        // Convert image paths to full URLs
        const data = rows.map((driver) => {
            const item = driver.toJSON();
            console.log("sdfsdf", 
                    getImageUrl(item.details.aadhar_img));
            
            if (item.details) {

                item.details.aadhar_img =
                    getImageUrl(item.details.aadhar_img);

                item.details.aadhar_back_img =
                    getImageUrl(item.details.aadhar_back_img);

                item.details.driving_licence_img =
                    getImageUrl(item.details.driving_licence_img);

                item.details.driving_licence_back_img =
                    getImageUrl(item.details.driving_licence_back_img);

                item.details.driver_authorized_letter_img =
                    getImageUrl(item.details.driver_authorized_letter_img);

                item.details.smart_card_img =
                    getImageUrl(item.details.smart_card_img);

                item.details.smart_card_back_img =
                    getImageUrl(item.details.smart_card_back_img);
            }

            return item;
        });

        res.json({
            success: true,
            data,
            pagination: {
                total: count,
                page: p,
                limit: lim,
                pages: Math.ceil(count / lim)
            }
        });

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
    const data = driver.toJSON();

        // Convert image paths to full URLs
          if (data.details) {

              data.details.aadhar_img =
                  getImageUrl(data.details.aadhar_img);

              data.details.aadhar_back_img =
                  getImageUrl(data.details.aadhar_back_img);

              data.details.driving_licence_img =
                  getImageUrl(data.details.driving_licence_img);

              data.details.driving_licence_back_img =
                  getImageUrl(data.details.driving_licence_back_img);

              data.details.driver_authorized_letter_img =
                  getImageUrl(data.details.driver_authorized_letter_img);

              data.details.smart_card_img =
                  getImageUrl(data.details.smart_card_img);

              data.details.smart_card_back_img =
                  getImageUrl(data.details.smart_card_back_img);
          }

        res.json({
            success: true,
            data
        });
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

    const driverFolder = `drivers/${driver.id}`;

     const savedAadharImg = saveBase64File(
        aadhar_img || details?.aadhar_img,
        driverFolder,
        'aadhar'
    );


    const savedPanImg = saveBase64File(
        pan_img || details?.pan_img,
        driverFolder,
        'pan'
    );

    const driverDetailsData = {
        ...(details || {}),

        driver_id: driver.id,

        aadhar:
            aadhar ||
            details?.aadhar,

        aadhar_img:
            savedAadharImg,

        smart_card_number:
            pan ||
            details?.smart_card_number,

        smart_card_img:
            savedPanImg,
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

if (!driver) {
    return res.status(404).json({
        success: false,
        message: 'Driver not found'
    });
}

const {
    name,
    email,
    mobile,
    aadhar,
    pan,
    sex,
    address,
    status,
    block_status,
    online_status,
    aadhar_img,
    pan_img,
    details
} = req.body;


// Find existing driver details
const existingDetail = await DriverDetail.findOne({
    where: {
        driver_id: driver.id
    }
});

const driverFolder = `drivers/${driver.id}`;

console.log('Existing DriverDetail:', existingDetail?.toJSON());


// Existing images
const oldAadharImg =
    existingDetail?.aadhar_img || null;

const oldPanImg =
    existingDetail?.smart_card_img || null;

console.log('Old Aadhar:', oldAadharImg);
console.log('Old PAN:', oldPanImg);


// Replace Aadhar image
const newAadharImg = replaceFile(
    aadhar_img,
    oldAadharImg,
    driverFolder,
    'aadhar'
);


// Replace PAN / Smart Card image
const newPanImg = replaceFile(
    pan_img,
    oldPanImg,
    driverFolder,
    'pan'
);


console.log('New Aadhar:', newAadharImg);
console.log('New PAN:', newPanImg);


// Update Driver table
await driver.update({
    name,
    email,
    mobile,
    aadhar,
    pan,
    sex,
    address,
    status,
    block_status,
    online_status
});


// Prepare DriverDetail data
const detailPayload = {
    ...(details || {}),

    ...(aadhar
        ? {
            aadhar: aadhar
        }
        : {}),

    ...(newAadharImg
        ? {
            aadhar_img: newAadharImg
        }
        : {}),

    ...(pan
        ? {
            smart_card_number: pan
        }
        : {}),

    ...(newPanImg
        ? {
            smart_card_img: newPanImg
        }
        : {})
};


// Update or create DriverDetail
if (existingDetail) {

    await existingDetail.update(detailPayload);

} else {

    await DriverDetail.create({
        ...detailPayload,
        driver_id: driver.id
    });

}


return res.json({
    success: true,
    message: 'Driver updated successfully'
});  } catch (err) {
    next(err);
  }
};

// ── Delete Driver ──────────────────────────────────────────
exports.destroy = async (req, res, next) => {
  try {
    const driver = await Driver.findByPk(req.params.id);
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });
    deleteFolder(
            `drivers/${driver.id}`
        );
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
