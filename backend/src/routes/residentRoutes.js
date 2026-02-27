const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");


const {
    uploadResidents,
    getAllResidents,
    getDueSoonResidents,
    createResident
} = require("../controllers/residentController");

router.post("/upload", upload.single("file"), uploadResidents);
router.get("/", getAllResidents);
router.get("/due-soon", getDueSoonResidents);
router.post('/create-account', createResident);

module.exports = router;

