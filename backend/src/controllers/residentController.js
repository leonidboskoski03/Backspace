const xlsx = require("xlsx");
const { z } = require("zod");
const { isValid } = require("date-fns");
const Resident = require("../models/Resident");

// POST /api/residents/upload
const uploadResidents = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);

    if (!rows.length) return res.status(400).json({ message: "Excel file is empty" });

    const results = { created: 0, updated: 0, errors: [] };

    const normalizedRows = rows.map((row) =>
      Object.fromEntries(Object.entries(row).map(([k, v]) => [k.trim(), v]))
    );

    for (const row of normalizedRows) {
      const name       = row["Name"]?.toString().trim();
      const surname    = row["Surname"]?.toString().trim();
      const flatNumber = row["Flat Number"]?.toString().trim();
      const rawDate    = row["Payment Date"];

      if (!name || !surname || !flatNumber || !rawDate) {
        results.errors.push({ row, reason: "Missing required fields" });
        continue;
      }

      let paymentDate;
      if (typeof rawDate === "number") {
        const parsed = xlsx.SSF.parse_date_code(rawDate);
        paymentDate = new Date(parsed.y, parsed.m - 1, parsed.d);
      } else {
        const dateStr = rawDate.toString().trim();
        const dotFormat = dateStr.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
        if (dotFormat) {
          const [, day, month, year] = dotFormat;
          paymentDate = new Date(Number(year), Number(month) - 1, Number(day));
        } else {
          paymentDate = new Date(dateStr);
        }
      }

      if (!isValid(paymentDate)) {
        results.errors.push({ row, reason: `Invalid Payment Date: "${rawDate}"` });
        continue;
      }

      // Scoped to this supporter only
      const existing = await Resident.findOne({ flatNumber, supporter: req.supporterId });
      if (existing) {
        existing.name        = name;
        existing.surname     = surname;
        existing.paymentDate = paymentDate;
        existing.isDueSoon   = false;
        await existing.save();
        results.updated++;
      } else {
        await Resident.create({ name, surname, flatNumber, paymentDate, isDueSoon: false, supporter: req.supporterId });
        results.created++;
      }
    }

    res.status(200).json({ message: "Upload complete", ...results });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/residents
const getAllResidents = async (req, res) => {
  try {
    const residents = await Resident.find({ supporter: req.supporterId }).sort({ flatNumber: 1 });
    res.status(200).json(residents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/residents/due-soon
const getDueSoonResidents = async (req, res) => {
  try {
    const residents = await Resident.find({ supporter: req.supporterId, isDueSoon: true }).sort({ flatNumber: 1 });
    res.status(200).json(residents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/residents/by-date?date=YYYY-MM-DD
const getResidentsByDate = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: "date query param is required" });

    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const residents = await Resident.find({
      supporter: req.supporterId,
      paymentDate: { $gte: start, $lte: end },
    }).sort({ flatNumber: 1 });

    res.status(200).json(residents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createResidentSchema = z.object({
  name:        z.string().min(1, 'Name is required'),
  surname:     z.string().min(1, 'Surname is required'),
  flatNumber:  z.string().min(1, 'Flat number is required'),
  paymentDate: z.string().min(1, 'Payment date is required'),
});

// POST /api/residents/create-account
const createResident = async (req, res) => {
  try {
    const validatedData = createResidentSchema.parse(req.body);

    const existingResident = await Resident.findOne({
      flatNumber: validatedData.flatNumber,
      supporter:  req.supporterId,
    });

    if (existingResident) {
      return res.status(400).json({ success: false, message: 'Resident with this flat number already exists' });
    }

    const resident = await Resident.create({
      name:        validatedData.name,
      surname:     validatedData.surname,
      flatNumber:  validatedData.flatNumber,
      paymentDate: new Date(validatedData.paymentDate),
      supporter:   req.supporterId,
    });

    res.status(201).json({ success: true, message: 'Resident created successfully', data: resident });
  } catch (error) {
    if (error instanceof z.ZodError)
      return res.status(400).json({ success: false, message: 'Validation error', errors: error.errors });
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/residents/:id
const deleteResident = async (req, res) => {
  try {
    const resident = await Resident.findOneAndDelete({
      _id:       req.params.id,
      supporter: req.supporterId,
    })

    if (!resident) return res.status(404).json({ message: 'Resident not found' })

    res.status(200).json({ message: 'Resident deleted successfully' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = { uploadResidents, getAllResidents, getDueSoonResidents, createResident, getResidentsByDate, deleteResident }
