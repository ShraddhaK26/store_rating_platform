const bcrypt = require("bcryptjs");
const pool = require("../config/db");

const passwordRegex = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!passwordRegex.test(newPassword || "")) {
      return res.status(400).json({
        message: "New password must be 8-16 characters with an uppercase letter and a special character."
      });
    }

    const [rows] = await pool.query("SELECT password FROM users WHERE id = ?", [req.user.id]);
    if (!rows.length) return res.status(404).json({ message: "User not found." });

    if (!(await bcrypt.compare(currentPassword || "", rows[0].password))) {
      return res.status(400).json({ message: "Current password is incorrect." });
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password = ? WHERE id = ?", [hash, req.user.id]);

    res.json({ message: "Password changed successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Password change failed." });
  }
};

exports.getStats = async (req, res) => {
  try {
    const [[u]] = await pool.query("SELECT COUNT(*) AS total FROM users");
    const [[s]] = await pool.query("SELECT COUNT(*) AS total FROM stores");
    const [[r]] = await pool.query("SELECT COUNT(*) AS total FROM ratings");
    res.json({ totalUsers: u.total, totalStores: s.total, totalRatings: r.total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not load statistics." });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { name = "", email = "", address = "", role = "" } = req.query;
    let sql = `
      SELECT id,name,email,address,role,created_at
      FROM users
      WHERE name LIKE ? AND email LIKE ? AND address LIKE ?
    `;
    const params = [`%${name}%`, `%${email}%`, `%${address}%`];

    if (role) {
      sql += " AND role = ?";
      params.push(role);
    }
    sql += " ORDER BY created_at DESC";

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not load users." });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;

    if (!["admin", "user", "owner"].includes(role)) {
      return res.status(400).json({ message: "Invalid role." });
    }
    if (!name || name.length < 20 || name.length > 60) {
      return res.status(400).json({ message: "Name must be between 20 and 60 characters." });
    }
    if (!passwordRegex.test(password || "")) {
      return res.status(400).json({ message: "Password must be 8-16 characters with uppercase and special character." });
    }

    const [exists] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (exists.length) return res.status(409).json({ message: "Email already exists." });

    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      "INSERT INTO users (name,email,password,address,role) VALUES (?,?,?,?,?)",
      [name, email, hash, address || "", role]
    );

    res.status(201).json({ message: "User created.", id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not create user." });
  }
};
