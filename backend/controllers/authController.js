const jwt = require("jsonwebtoken");
const { User } = require("../models");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });

const signRefreshToken = (id) =>
  jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  });

exports.register = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const user = await User.create({ email, username, password });
    const token = signToken(user.id);
    const refreshToken = signRefreshToken(user.id);

    res.status(201).json({ token, refreshToken, user });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user || !(await user.validatePassword(password))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = signToken(user.id);
    const refreshToken = signRefreshToken(user.id);

    res.json({ token, refreshToken, user });
  } catch (err) {
    next(err);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token required" });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    const token = signToken(user.id);
    res.json({ token });
  } catch (err) {
    res.status(401).json({ error: "Invalid refresh token" });
  }
};

exports.me = async (req, res) => {
  res.json({ user: req.user });
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { username, avatarUrl } = req.body;
    await req.user.update({ username, avatarUrl });
    res.json({ user: req.user });
  } catch (err) {
    next(err);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const valid = await req.user.validatePassword(currentPassword);
    if (!valid) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }
    await req.user.update({ password: newPassword });
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    next(err);
  }
};
