const express  = require("express");
const router   = express.Router();
const upload   = require("../middleware/upload");
const { protect } = require("../middleware/auth");


const {
    uploadResidents,
    getAllResidents,
    getDueSoonResidents,
    createResident,
    getResidentsByDate,
    deleteResident,
} = require("../controllers/residentController");

// All resident routes require a valid supporter token
router.use(protect);

router.post("/upload",         upload.single("file"), uploadResidents);
router.get("/",                getAllResidents);
router.get("/due-soon",        getDueSoonResidents);
router.get("/by-date",         getResidentsByDate);
router.post("/create-account", createResident);
router.delete("/:id",          deleteResident);

module.exports = router;
