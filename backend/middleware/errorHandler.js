const logger = require("../utils/logger");

module.exports = (err, req, res, next) => {
  logger.error(err.message, { stack: err.stack, path: req.path, method: req.method });

  // Sequelize validation error
  if (err.name === "SequelizeValidationError") {
    const errors = err.errors.map((e) => ({ field: e.path, message: e.message }));
    return res.status(422).json({ error: "Validation failed", details: errors });
  }

  // Sequelize unique constraint
  if (err.name === "SequelizeUniqueConstraintError") {
    return res.status(409).json({ error: "Resource already exists" });
  }

  const status = err.status || 500;
  const message = process.env.NODE_ENV === "production" && status === 500
    ? "Internal server error"
    : err.message;

  res.status(status).json({ error: message });
};
