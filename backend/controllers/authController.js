const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    address: user.address,
    role: user.role
  };
}

exports.signup = async (req, res) => {
  try {
    const { name, email, password, address } = req.body;

    if (!name || name.length < 20 || name.length > 60) {
      return res.status(400).json({ message: "Name must be between 20 and 60 characters." });
    }
    if (!emailRegex.test(email || "")) {
      return res.status(400).json({ message: "Enter a valid email address." });
    }
    if (!passwordRegex.test(password || "")) {
      return res.status(400).json({
        message: "Password must be 8-16 characters and contain at least one uppercase letter and one special character."
      });
    }
    if (!address || address.length > 400) {
      return res.status(400).json({ message: "Address is required and must be 400 characters or less." });
    }

    const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length) {
      return res.status(409).json({ message: "Email is already registered." });
    }

    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO users (name,email,password,address,role) VALUES (?,?,?,?, 'user')",
      [name, email, hash, address]
    );

    res.status(201).json({ message: "Signup successful. You can now log in." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Signup failed." });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const [rows] = await pool.query(
      "SELECT id,name,email,password,address,role FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (!rows.length) return res.status(401).json({ message: "Invalid email or password." });

    const user = rows[0];
    const ok = await bcrypt.compare(password || "", user.password);

    if (!ok) return res.status(401).json({ message: "Invalid email or password." });

    if (role && user.role !== role) {
      return res.status(403).json({ message: `This account is not a ${role} account.` });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, user: publicUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed." });
  }
};
