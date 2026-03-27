const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// DB CONNECTION
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});


// =============================
// ✅ TEST ROUTE
// =============================
app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      message: "Database Connected Successfully",
      time: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({ error: "Database connection failed" });
  }
});


// =============================
// ✅ CREATE FAMILY
// =============================
app.post("/family", async (req, res) => {
  const { head_name, address, mobile_no, total_members } = req.body;

  if (!head_name || !mobile_no) {
    return res.status(400).json({ error: "Required fields missing" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO families (head_name, address, mobile_no, total_members)
       VALUES ($1, $2, $3, $4)
       RETURNING family_id`,
      [head_name, address, mobile_no, total_members]
    );

    res.json({
      message: "Family created",
      family_id: result.rows[0].family_id,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


// =============================
// ✅ ADD FAMILY MEMBER
// =============================
app.post("/member", async (req, res) => {
  const { family_id, name, age, occupation, mobile_no } = req.body;

  if (!family_id || !name) {
    return res.status(400).json({ error: "Required fields missing" });
  }

  try {
    await pool.query(
      `INSERT INTO family_members
       (family_id, name, age, occupation, mobile_no)
       VALUES ($1, $2, $3, $4, $5)`,
      [family_id, name, age, occupation, mobile_no]
    );

    res.json({ message: "Member added successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


// =============================
// 🔥 FULL SYNC (MAIN FEATURE)
// =============================
app.post("/sync", async (req, res) => {
  const { families, members } = req.body;

  try {
    // 🔹 Sync Families
    for (let f of families) {
      await pool.query(
        `INSERT INTO families 
         (family_id, head_name, address, mobile_no, total_members)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (family_id) DO NOTHING`,
        [f.family_id, f.head_name, f.address, f.mobile_no, f.total_members]
      );

      // 🔹 Log sync
      await pool.query(
        `INSERT INTO sync_logs (family_id, status)
         VALUES ($1, $2)`,
        [f.family_id, "success"]
      );
    }

    // 🔹 Sync Members
    for (let m of members) {
      await pool.query(
        `INSERT INTO family_members
         (member_id, family_id, name, age, occupation, mobile_no)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (member_id) DO NOTHING`,
        [
          m.member_id,
          m.family_id,
          m.name,
          m.age,
          m.occupation,
          m.mobile_no,
        ]
      );
    }

    res.json({ message: "Full sync successful" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Sync failed" });
  }
});


// =============================
// ✅ GET ALL DATA
// =============================
app.get("/families", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM families");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/members", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM family_members");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// =============================
// 🚀 SERVER START
// =============================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});