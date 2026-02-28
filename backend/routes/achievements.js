const router = require("express").Router();
const { body } = require("express-validator");
const ctrl = require("../controllers/achievementController");
const auth = require("../middleware/auth");
const validate = require("../middleware/validate");

router.use(auth);

// Achievements
router.get("/", ctrl.list);
router.post("/check", ctrl.check);

// Writing goals
router.get("/goal", ctrl.getGoal);
router.put("/goal", [
  body("dailyWordGoal").optional().isInt({ min: 50, max: 10000 }),
  body("weeklyEntryGoal").optional().isInt({ min: 1, max: 14 }),
  body("reminderEnabled").optional().isBoolean(),
  body("reminderTime").optional().matches(/^\d{2}:\d{2}$/),
  body("reminderEmail").optional().isBoolean(),
  validate,
], ctrl.updateGoal);
router.get("/goal/progress", ctrl.getGoalProgress);

module.exports = router;
