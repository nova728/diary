const router = require("express").Router();
const ctrl = require("../controllers/memoryController");
const auth = require("../middleware/auth");

router.use(auth);

router.get("/on-this-day", ctrl.onThisDay);
router.get("/random", ctrl.randomMemory);
router.get("/timeline", ctrl.timeline);
router.get("/heatmap", ctrl.heatmap);

module.exports = router;
