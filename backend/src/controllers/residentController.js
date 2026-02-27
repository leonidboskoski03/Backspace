const xlsx = require("xlsx");
const {z} = require("zod");
const { isValid, parseISO } = require("date-fns");
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

    for (const row of rows) {
      const name = row["Name"]?.toString().trim();
      const surname = row["Surname"]?.toString().trim();
      const flatNumber = row["Flat Number"]?.toString().trim();
      const rawDate = row["Payment Date"];

      if (!name || !surname || !flatNumber || !rawDate) {
        results.errors.push({ row, reason: "Missing required fields" });
        continue;
      }

      // xlsx can parse dates as serial numbers or strings
      let paymentDate;
      if (typeof rawDate === "number") {
        paymentDate = xlsx.SSF.parse_date_code(rawDate);
        paymentDate = new Date(paymentDate.y, paymentDate.m - 1, paymentDate.d);
      } else {
        paymentDate = new Date(rawDate);
      }

      if (!isValid(paymentDate)) {
        results.errors.push({ row, reason: "Invalid Payment Date" });
        continue;
      }

      const existing = await Resident.findOne({ flatNumber });
      if (existing) {
        existing.name = name;
        existing.surname = surname;
        existing.paymentDate = paymentDate;
        await existing.save();
        results.updated++;
      } else {
        await Resident.create({ name, surname, flatNumber, paymentDate });
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
    const residents = await Resident.find().sort({ flatNumber: 1 });
    res.status(200).json(residents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/residents/due-soon
const getDueSoonResidents = async (req, res) => {
  try {
    const residents = await Resident.find({ isDueSoon: true }).sort({ flatNumber: 1 });
    res.status(200).json(residents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createResidentSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    surname: z.string().min(1, 'Surname is required'),
    flatNumber: z.string().min(1, 'Flat number is required'),
    paymentDate: z.string().min(1, 'Payment date is required')
});

const createResident = async (req, res) => {
    try {
        const validatedData = createResidentSchema.parse(req.body);

        const existingResident = await Resident.findOne({flatNumber: validatedData.flatNumber});
        if (existingResident) {
            return res.status(400).json({
                success: false,
                message: 'Resident with this flat number already exists'
            });
        }

        // Create new resident
        const resident = new Resident({
            name: validatedData.name,
            surname: validatedData.surname,
            flatNumber: validatedData.flatNumber,
            paymentDate: new Date(validatedData.paymentDate)
        });

        await resident.save();

        res.status(201).json({
            success: true,
            message: 'Resident created successfully',
            data: resident
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: error.errors
            });
        }
    }
};

module.exports = { uploadResidents, getAllResidents, getDueSoonResidents, createResident};

