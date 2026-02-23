const router = require("express").Router();
const { body, param } = require("express-validator");
const ctrl = require("../controllers/entryController");
const auth = require("../middleware/auth");
const validate = require("../middleware/validate");

const MOODS = ["happy", "calm", "sad", "angry", "anxious", "excited", "grateful", "tired"];

const entryRules = [
  body("title").trim().isLength({ min: 1, max: 300 }).withMessage("Title required (max 300 chars)"),
  body("content").notEmpty().withMessage("Content required"),
  body("mood").optional({ nullable: true }).isIn(MOODS).withMessage("Invalid mood"),
  body("date").isDate().withMessage("Valid date required"),
  body("tags").optional().isArray({ max: 20 }),
  body("tags.*").optional().trim().isLength({ min: 1, max: 50 }),
];

router.use(auth);

router.get("/", ctrl.list);
router.get("/:id", [param("id").isUUID(), validate], ctrl.get);
router.post("/", [...entryRules, validate], ctrl.create);
router.put("/:id", [param("id").isUUID(), ...entryRules.map((r) => r.optional()), validate], ctrl.update);
router.delete("/:id", [param("id").isUUID(), validate], ctrl.remove);
router.patch("/:id/pin", [param("id").isUUID(), validate], ctrl.togglePin);

module.exports = router;
