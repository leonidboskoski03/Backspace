const express = require("express");
const router  = express.Router();
const { registerSupporter, loginSupporter } = require("../controllers/supporterController");

router.post("/register", registerSupporter);
router.post("/login",    loginSupporter);

module.exports = router;

