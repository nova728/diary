const router = require("express").Router();
const { body } = require("express-validator");
const ctrl = require("../controllers/authController");
const auth = require("../middleware/auth");
const validate = require("../middleware/validate");

const emailRules = body("email").isEmail().normalizeEmail().withMessage("Valid email required");
const passwordRules = body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters");

router.post("/register", [
  emailRules,
  body("username").trim().isLength({ min: 2, max: 100 }).withMessage("Username must be 2-100 characters"),
  passwordRules,
  validate,
], ctrl.register);

router.post("/login", [emailRules, validate], ctrl.login);

router.post("/refresh", ctrl.refresh);

router.get("/me", auth, ctrl.me);

router.put("/profile", auth, [
  body("username").optional().trim().isLength({ min: 2, max: 100 }),
  validate,
], ctrl.updateProfile);

router.put("/password", auth, [
  body("currentPassword").notEmpty(),
  passwordRules,
  validate,
], ctrl.changePassword);

module.exports = router;
