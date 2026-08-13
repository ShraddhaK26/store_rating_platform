const pool = require("../config/db");

exports.getStores = async (req, res) => {
  try {
    const search = req.query.search || "";
    const [rows] = await pool.query(`
      SELECT
        s.id, s.name, s.email, s.address,
        COALESCE(ROUND(AVG(r.rating),1),0) AS overallRating,
        COALESCE((
          SELECT r2.rating FROM ratings r2
          WHERE r2.store_id=s.id AND r2.user_id=?
          LIMIT 1
        ),0) AS userRating
      FROM stores s
      LEFT JOIN ratings r ON r.store_id=s.id
      WHERE s.name LIKE ? OR s.address LIKE ?
      GROUP BY s.id,s.name,s.email,s.address
      ORDER BY s.name
    `, [req.user.id, `%${search}%`, `%${search}%`]);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not load stores." });
  }
};

exports.getAdminStores = async (req, res) => {
  try {
    const { name = "", email = "", address = "" } = req.query;
    const [rows] = await pool.query(`
      SELECT
        s.id,s.name,s.email,s.address,
        COALESCE(ROUND(AVG(r.rating),1),0) AS rating,
        u.name AS ownerName,u.email AS ownerEmail
      FROM stores s
      LEFT JOIN ratings r ON r.store_id=s.id
      LEFT JOIN users u ON u.id=s.owner_id
      WHERE s.name LIKE ? AND s.email LIKE ? AND s.address LIKE ?
      GROUP BY s.id,s.name,s.email,s.address,u.name,u.email
      ORDER BY s.name
    `, [`%${name}%`, `%${email}%`, `%${address}%`]);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not load stores." });
  }
};

exports.getOwners = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id,name,email FROM users WHERE role='owner' ORDER BY name"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not load owners." });
  }
};

exports.createStore = async (req, res) => {
  try {
    const { name, email, address, ownerId } = req.body;

    if (!name || name.length < 20 || name.length > 60) {
      return res.status(400).json({ message: "Store name must be between 20 and 60 characters." });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Enter a valid store email." });
    }
    if (!address || address.length > 400) {
      return res.status(400).json({ message: "Address is required and must be 400 characters or less." });
    }

    if (ownerId) {
      const [owner] = await pool.query(
        "SELECT id FROM users WHERE id=? AND role='owner'",
        [ownerId]
      );
      if (!owner.length) return res.status(400).json({ message: "Selected owner does not exist." });
    }

    const [result] = await pool.query(
      "INSERT INTO stores (name,email,address,owner_id) VALUES (?,?,?,?)",
      [name,email,address,ownerId || null]
    );

    res.status(201).json({ message: "Store created.", id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not create store." });
  }
};

exports.getOwnerDashboard = async (req, res) => {
  try {
    const [stores] = await pool.query(`
      SELECT s.id,s.name,s.email,s.address,
             COALESCE(ROUND(AVG(r.rating),1),0) AS averageRating
      FROM stores s
      LEFT JOIN ratings r ON r.store_id=s.id
      WHERE s.owner_id=?
      GROUP BY s.id,s.name,s.email,s.address
      LIMIT 1
    `, [req.user.id]);

    if (!stores.length) {
      return res.json({ store: null, averageRating: 0, ratings: [] });
    }

    const store = stores[0];
    const [ratings] = await pool.query(`
      SELECT u.name,u.email,r.rating,r.updated_at
      FROM ratings r
      JOIN users u ON u.id=r.user_id
      WHERE r.store_id=?
      ORDER BY r.updated_at DESC
    `, [store.id]);

    res.json({ store, averageRating: store.averageRating, ratings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not load owner dashboard." });
  }
};
