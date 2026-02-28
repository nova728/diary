const router = require("express").Router();
const ctrl = require("../controllers/uploadController");
const auth = require("../middleware/auth");

router.use(auth);

router.post("/image", ctrl.uploadImage);
router.post("/images", ctrl.uploadImages);
router.delete("/image/:filename", ctrl.deleteImage);

module.exports = router;
