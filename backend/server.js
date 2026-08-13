require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const pool = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const storeRoutes = require("./routes/storeRoutes");
const ratingRoutes = require("./routes/ratingRoutes");

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173"
}));
app.use(express.json());

async function initDatabase() {
  const connection = await pool.getConnection();

  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(60) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        address VARCHAR(400) NOT NULL,
        role ENUM('admin','user','owner') NOT NULL DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS stores (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(60) NOT NULL,
        email VARCHAR(255) NOT NULL,
        address VARCHAR(400) NOT NULL,
        owner_id INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_store_owner
          FOREIGN KEY (owner_id) REFERENCES users(id)
          ON DELETE SET NULL ON UPDATE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS ratings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        store_id INT NOT NULL,
        rating INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT chk_rating CHECK (rating >= 1 AND rating <= 5),
        CONSTRAINT fk_rating_user FOREIGN KEY (user_id) REFERENCES users(id)
          ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT fk_rating_store FOREIGN KEY (store_id) REFERENCES stores(id)
          ON DELETE CASCADE ON UPDATE CASCADE,
        UNIQUE KEY unique_user_store (user_id, store_id)
      )
    `);

    const password = await bcrypt.hash("Admin@123", 10);

    await connection.query(`
      INSERT INTO users (name,email,password,address,role)
      SELECT ?,?,?,?,'admin'
      WHERE NOT EXISTS (SELECT 1 FROM users WHERE email=?)
    `, [
      "System Administrator Demo",
      "admin@example.com",
      password,
      "Administration Office",
      "admin@example.com"
    ]);

    await connection.query(`
      INSERT INTO users (name,email,password,address,role)
      SELECT ?,?,?,?,'owner'
      WHERE NOT EXISTS (SELECT 1 FROM users WHERE email=?)
    `, [
      "Store Owner Demo Account",
      "owner@example.com",
      password,
      "Store Owner Office",
      "owner@example.com"
    ]);

    const [owner] = await connection.query(
      "SELECT id FROM users WHERE email='owner@example.com' LIMIT 1"
    );

    if (owner.length) {
      await connection.query(`
        INSERT INTO stores (name,email,address,owner_id)
        SELECT ?,?,?,?
        WHERE NOT EXISTS (SELECT 1 FROM stores WHERE email=?)
      `, [
        "Demo Store Rating Platform",
        "demo.store@example.com",
        "Mumbai, Maharashtra, India",
        owner[0].id,
        "demo.store@example.com"
      ]);
    }
  } finally {
    connection.release();
  }
}

app.get("/", (req, res) => {
  res.json({ message: "Store Rating Platform API is running." });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/ratings", ratingRoutes);

const PORT = Number(process.env.PORT || 5000);

initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
      console.log("Demo admin: admin@example.com / Admin@123");
      console.log("Demo owner: owner@example.com / Admin@123");
    });
  })
  .catch((err) => {
    console.error("\nDatabase initialization failed.");
    console.error("Make sure MySQL Server is running and your .env values are correct.\n");
    console.error(err);
    process.exit(1);
  });
