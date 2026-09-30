'use strict';

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { AdminUser, Role, Permission } = require('../models');
const { logAction } = require('../middleware/auditLog');

const generateTokens = (user) => {
  const payload = { id: user.id, email: user.email, role: user.role?.name };
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m',
  });
  const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d',
  });
  return { accessToken, refreshToken };
};

// ── Login ──────────────────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await AdminUser.findOne({
      where: { email, is_active: true },
      include: [{ model: Role, as: 'role', include: [{ model: Permission, as: 'permissions' }] }],
    });

    if (!user || !(await user.comparePassword(password))) {
      await logAction({
        action: 'login_failed',
        module: 'auth',
        description: `Failed login attempt for ${email}`,
        ipAddress: req.ip,
        status: 'failed',
      });
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const { accessToken, refreshToken } = generateTokens(user);
    await user.update({ refresh_token: refreshToken, last_login_at: new Date() });

    await logAction({
      userId: user.id,
      userType: user.role?.name,
      userName: user.name,
      action: 'login',
      module: 'auth',
      description: 'User logged in',
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toJSON(),
        permissions: user.role?.permissions?.map((p) => p.name) || [],
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── Refresh Token ──────────────────────────────────────────
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'Refresh token required' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await AdminUser.findOne({
      where: { id: decoded.id, refresh_token: refreshToken, is_active: true },
      include: [{ model: Role, as: 'role', include: [{ model: Permission, as: 'permissions' }] }],
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }

    const tokens = generateTokens(user);
    await user.update({ refresh_token: tokens.refreshToken });

    res.json({
      success: true,
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Refresh token expired, please login again' });
    }
    next(err);
  }
};

// ── Logout ─────────────────────────────────────────────────
exports.logout = async (req, res, next) => {
  try {
    await req.user.update({ refresh_token: null });
    await logAction({
      userId: req.user.id,
      userType: req.user.role?.name,
      userName: req.user.name,
      action: 'logout',
      module: 'auth',
      description: 'User logged out',
      ipAddress: req.ip,
    });
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

// ── Get Current User ───────────────────────────────────────
exports.me = async (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user.toJSON(),
      permissions: req.userPermissions,
    },
  });
};

// ── Forgot Password ────────────────────────────────────────
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await AdminUser.findOne({ where: { email, is_active: true } });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ success: true, message: 'If that email exists, a reset link has been sent' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await user.update({
      password_reset_token: resetToken,
      password_reset_expires: resetExpires,
    });

    // In production: send email with reset link
    console.log(`[ForgotPassword] Reset token for ${email}: ${resetToken}`);

    res.json({ success: true, message: 'Password reset link sent to your email', ...(process.env.NODE_ENV === 'development' && { resetToken }) });
  } catch (err) {
    next(err);
  }
};

// ── Reset Password ─────────────────────────────────────────
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    const user = await AdminUser.findOne({
      where: { password_reset_token: token },
    });

    if (!user || !user.password_reset_expires || new Date() > user.password_reset_expires) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    await user.update({
      password,
      password_reset_token: null,
      password_reset_expires: null,
      refresh_token: null,
    });

    res.json({ success: true, message: 'Password reset successfully. Please login again.' });
  } catch (err) {
    next(err);
  }
};

// ── Change Password ────────────────────────────────────────
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await AdminUser.findByPk(req.user.id);

    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    await user.update({ password: newPassword });
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
};
