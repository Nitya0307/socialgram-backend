const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const pool = require("../db");

const router = express.Router();


// SIGNUP
router.post("/signup", async (req, res) => {

  try {

    const { username, email, mobile, password } = req.body;

    // CHECK EXISTING USER
    const existingUser = await pool.query(
      `
      SELECT * FROM users
      WHERE email = $1
      OR username = $2
      OR mobile = $3
      `,
      [email, username, mobile]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    // INSERT USER
    const newUser = await pool.query(
      `
      INSERT INTO users
      (username, email, mobile, password)
      VALUES ($1, $2, $3, $4)
      RETURNING id, username, email, mobile
      `,
      [username, email, mobile, hashedPassword]
    );

    // CREATE TOKEN
    const token = jwt.sign(
      { id: newUser.rows[0].id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // RESPONSE
    res.status(201).json({
      message: "Signup successful",
      token,
      user: newUser.rows[0],
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
});


// LOGIN
router.post("/login", async (req, res) => {

  try {

    const { identifier, password } = req.body;

    // FIND USER BY EMAIL OR USERNAME OR MOBILE
    const user = await pool.query(
      `
      SELECT * FROM users
      WHERE email = $1
      OR username = $1
      OR mobile = $1
      `,
      [identifier]
    );

    // USER NOT FOUND
    if (user.rows.length === 0) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    // CHECK PASSWORD
    const validPassword = await bcrypt.compare(
      password,
      user.rows[0].password
    );

    if (!validPassword) {
      return res.status(400).json({
        message: "Invalid password",
      });
    }

    // CREATE TOKEN
    const token = jwt.sign(
      { id: user.rows[0].id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // RESPONSE
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.rows[0].id,
        username: user.rows[0].username,
        email: user.rows[0].email,
        mobile: user.rows[0].mobile,
      },
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
});


// GOOGLE USER CHECK
router.get("/google-user", async (req, res) => {

  try {

    const { email } = req.query;

    const user = await pool.query(
      `
      SELECT *
      FROM users
      WHERE email = $1
      `,
      [email]
    );

    if (user.rows.length === 0) {

      return res.json({
        user: null,
      });
    }

    res.json({
      user: user.rows[0],
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
});


// GOOGLE SIGNUP
router.post("/google-signup", async (req, res) => {

  try {

    const {
      username,
      email,
      mobile,
      profile_pic,
    } = req.body;

    // CHECK EXISTING USER
    const existingUser = await pool.query(
      `
      SELECT *
      FROM users
      WHERE email = $1
      `,
      [email]
    );

    if (existingUser.rows.length > 0) {

      return res.json({
        user: existingUser.rows[0],
      });
    }

    // HASH RANDOM PASSWORD
    const hashedPassword = await bcrypt.hash(
      "google_oauth_user",
      10
    );

    // INSERT USER
    const newUser = await pool.query(
      `
      INSERT INTO users
      (
        username,
        email,
        mobile,
        password,
        profile_pic
      )

      VALUES ($1, $2, $3, $4, $5)

      RETURNING
      id,
      username,
      email,
      mobile,
      profile_pic
      `,
      [
        username,
        email,
        mobile || "",
        hashedPassword,
        profile_pic || "",
      ]
    );

    res.json({
      user: newUser.rows[0],
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
});


module.exports = router;