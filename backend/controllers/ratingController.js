const pool = require("../config/db");

exports.submitRating = async (req, res) => {
  try {
    const storeId = Number(req.body.storeId);
    const rating = Number(req.body.rating);

    if (!Number.isInteger(storeId) || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be an integer from 1 to 5." });
    }

    const [stores] = await pool.query("SELECT id FROM stores WHERE id=?", [storeId]);
    if (!stores.length) return res.status(404).json({ message: "Store not found." });

    const [existing] = await pool.query(
      "SELECT id FROM ratings WHERE user_id=? AND store_id=?",
      [req.user.id, storeId]
    );

    if (existing.length) {
      await pool.query(
        "UPDATE ratings SET rating=?, updated_at=CURRENT_TIMESTAMP WHERE id=?",
        [rating, existing[0].id]
      );
      return res.json({ message: "Rating updated successfully." });
    }

    await pool.query(
      "INSERT INTO ratings (user_id,store_id,rating) VALUES (?,?,?)",
      [req.user.id, storeId, rating]
    );

    res.status(201).json({ message: "Rating submitted successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not save rating." });
  }
};

exports.getMyRatings = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT r.id,r.store_id AS storeId,r.rating,r.updated_at,
             s.name AS storeName
      FROM ratings r
      JOIN stores s ON s.id=r.store_id
      WHERE r.user_id=?
      ORDER BY r.updated_at DESC
    `, [req.user.id]);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not load ratings." });
  }
};
