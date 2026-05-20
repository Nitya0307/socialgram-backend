const express = require("express");

const pool = require("../db");

const router = express.Router();


// CREATE POST
router.post("/create", async (req, res) => {

  try {

    const {
      user_id,
      description,
      media_url,
    } = req.body;

    const newPost = await pool.query(

      `INSERT INTO posts
      (user_id, description, media_url)
      VALUES ($1, $2, $3)
      RETURNING *`,

      [user_id, description, media_url]
    );

    res.status(201).json({
      message: "Post created successfully",
      post: newPost.rows[0],
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

module.exports = router;