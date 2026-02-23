const router = require("express").Router();
const ctrl = require("../controllers/statsController");
const auth = require("../middleware/auth");

router.use(auth);

router.get("/overview", ctrl.overview);
router.get("/moods", ctrl.moods);
router.get("/activity", ctrl.activity);
router.get("/tags", ctrl.tags);

module.exports = router;
