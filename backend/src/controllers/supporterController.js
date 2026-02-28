const bcrypt = require("bcryptjs");
const jwt    = require("jsonwebtoken");
const { z }  = require("zod");
const Supporter = require("../models/Supporter");

const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName:  z.string().min(1, "Last name is required"),
  email:     z.string().email("Invalid email"),
  password:  z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});

// POST /api/supporters/register
const registerSupporter = async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);

    const exists = await Supporter.findOne({ email: data.email });
    if (exists) return res.status(409).json({ success: false, message: "Email already in use" });

    const hashed   = await bcrypt.hash(data.password, 10);
    const supporter = await Supporter.create({ ...data, password: hashed });

    if (!process.env.JWT_SECRET) {
      console.error('[auth] JWT_SECRET is not set in .env!')
      return res.status(500).json({ message: 'Server misconfiguration' })
    }

    const token = jwt.sign({ id: supporter._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    console.log('[register] token generated:', token ? 'OK' : 'FAILED')

    res.status(201).json({
      success:   true,
      message:   "Supporter registered",
      token,
      supporter: {
        id:        supporter._id,
        firstName: supporter.firstName,
        lastName:  supporter.lastName,
        email:     supporter.email,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError)
      return res.status(400).json({ success: false, message: "Validation error", errors: err.errors });
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/supporters/login
const loginSupporter = async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);

    const supporter = await Supporter.findOne({ email: data.email });
    if (!supporter) return res.status(401).json({ success: false, message: "Invalid credentials" });

    const match = await bcrypt.compare(data.password, supporter.password);
    if (!match) return res.status(401).json({ success: false, message: "Invalid credentials" });

    if (!process.env.JWT_SECRET) {
      console.error('[auth] JWT_SECRET is not set in .env!')
      return res.status(500).json({ message: 'Server misconfiguration' })
    }

    const token = jwt.sign({ id: supporter._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    console.log('[login] token generated:', token ? 'OK' : 'FAILED')

    res.status(200).json({
      success:   true,
      token,
      supporter: {
        id:        supporter._id,
        firstName: supporter.firstName,
        lastName:  supporter.lastName,
        email:     supporter.email,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError)
      return res.status(400).json({ success: false, message: "Validation error", errors: err.errors });
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { registerSupporter, loginSupporter };
