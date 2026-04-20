const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// =============================
// ✅ MODELS
// =============================
const Family = require("./models/Family");
const Member = require("./models/Member");

// =============================
// ✅ TEST ROUTE
// =============================
app.get("/", (req, res) => {
  res.send("MongoDB Backend Running 🚀");
});

// =============================
// ✅ CREATE FAMILY
// =============================
app.post("/family", async (req, res) => {
  try {
    const family = new Family(req.body);
    await family.save();

    res.json({
      message: "Family created",
      family_id: family._id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// =============================
// ✅ ADD MEMBER
// =============================
app.post("/member", async (req, res) => {
  try {
    const member = new Member(req.body);
    await member.save();

    res.json({ message: "Member added" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// =============================
// 🔥 SYNC API
// =============================
app.post("/sync", async (req, res) => {
  const { families = [], members = [] } = req.body;

  try {
    await Family.insertMany(families, { ordered: false });
    await Member.insertMany(members, { ordered: false });

    res.json({ message: "Full sync successful" });
  } catch (err) {
    console.error(err);
    res.json({ message: "Partial sync done" });
  }
});

// =============================
// ✅ GET DATA
// =============================
app.get("/families", async (req, res) => {
  try {
    const data = await Family.find();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/members", async (req, res) => {
  try {
    const data = await Member.find();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// =============================
// 🚀 DB CONNECT + SERVER START
// =============================
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected ✅");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  })
  .catch((err) => {
    console.error("Mongo Error ❌:", err);
  });