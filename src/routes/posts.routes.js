const express = require("express");

const pool = require("../config/db");

const authMiddleware =
  require("../middleware/auth.middleware");

const router = express.Router();


// =============================
// CREATE POST
// =============================
router.post(
  "/create",
  authMiddleware,
  async (req, res) => {

    try {

      const {
        description,
        media_url,
      } = req.body;

      // GET USER FROM TOKEN
      const user_id = req.user.id;

      const newPost =
        await pool.query(

          `INSERT INTO posts
          (user_id, description, media_url)
          VALUES ($1, $2, $3)
          RETURNING *`,

          [
            user_id,
            description,
            media_url,
          ]
        );

      res.status(201).json({
        message:
          "Post created successfully",

        post:
          newPost.rows[0],
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);



// =============================
// LIKE / UNLIKE POST
// =============================
router.post(
  "/like",
  authMiddleware,
  async (req, res) => {

    try {

      const { post_id } = req.body;

      // GET USER FROM TOKEN
      const user_id = req.user.id;

      // CHECK IF ALREADY LIKED
      const existingLike =
        await pool.query(

          `SELECT * FROM likes
          WHERE user_id = $1
          AND post_id = $2`,

          [user_id, post_id]
        );

      // UNLIKE
      if (
        existingLike.rows.length > 0
      ) {

        await pool.query(

          `DELETE FROM likes
          WHERE user_id = $1
          AND post_id = $2`,

          [user_id, post_id]
        );

        return res.status(200).json({
          message: "Post unliked",
        });
      }

      // LIKE
      await pool.query(

        `INSERT INTO likes
        (user_id, post_id)
        VALUES ($1, $2)`,

        [user_id, post_id]
      );

      res.status(201).json({
        message: "Post liked",
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);



// =============================
// ADD COMMENT
// =============================
router.post(
  "/comment",
  authMiddleware,
  async (req, res) => {

    try {

      const {
        post_id,
        comment,
      } = req.body;

      // GET USER FROM TOKEN
      const user_id = req.user.id;

      const newComment =
        await pool.query(

          `INSERT INTO comments
          (user_id, post_id, comment)
          VALUES ($1, $2, $3)
          RETURNING *`,

          [
            user_id,
            post_id,
            comment,
          ]
        );

      res.status(201).json({
        message: "Comment added",
        comment:
          newComment.rows[0],
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);



// =============================
// GET ALL POSTS
// =============================
router.get("/", async (req, res) => {

  try {

    const allPosts =
      await pool.query(

        `SELECT
          posts.*,
          users.username,
          users.profile_pic,

          COUNT(DISTINCT likes.id)
          AS likes_count,

          COUNT(DISTINCT comments.id)
          AS comments_count

        FROM posts

        INNER JOIN users
        ON posts.user_id = users.id

        LEFT JOIN likes
        ON posts.id = likes.post_id

        LEFT JOIN comments
        ON posts.id = comments.post_id

        GROUP BY
        posts.id,
        users.username,
        users.profile_pic

        ORDER BY posts.id DESC`
      );

    res.status(200).json(
      allPosts.rows
    );

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
});



// =============================
// DELETE POST
// =============================
router.delete(
  "/:id",
  authMiddleware,
  async (req, res) => {

    try {

      const { id } = req.params;

      // CHECK OWNERSHIP
      const postCheck =
        await pool.query(

          `SELECT * FROM posts
          WHERE id = $1
          AND user_id = $2`,

          [id, req.user.id]
        );

      if (
        postCheck.rows.length === 0
      ) {

        return res.status(403).json({
          message: "Unauthorized",
        });
      }

      await pool.query(

        `DELETE FROM posts
        WHERE id = $1`,

        [id]
      );

      res.status(200).json({
        message:
          "Post deleted successfully",
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);



// =============================
// UPDATE POST
// =============================
router.put(
  "/:id",
  authMiddleware,
  async (req, res) => {

    try {

      const { id } = req.params;

      const {
        description,
        media_url,
      } = req.body;

      // CHECK OWNERSHIP
      const postCheck =
        await pool.query(

          `SELECT * FROM posts
          WHERE id = $1
          AND user_id = $2`,

          [id, req.user.id]
        );

      if (
        postCheck.rows.length === 0
      ) {

        return res.status(403).json({
          message: "Unauthorized",
        });
      }

      const updatedPost =
        await pool.query(

          `UPDATE posts
          SET
            description = $1,
            media_url = $2
          WHERE id = $3
          RETURNING *`,

          [
            description,
            media_url,
            id,
          ]
        );

      res.status(200).json({
        message:
          "Post updated successfully",

        post:
          updatedPost.rows[0],
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);



// =============================
// GET SINGLE POST
// =============================
router.get("/:id", async (req, res) => {

  try {

    const { id } = req.params;

    const post =
      await pool.query(

        `SELECT
          posts.*,
          users.username,
          users.profile_pic

        FROM posts

        INNER JOIN users
        ON posts.user_id = users.id

        WHERE posts.id = $1`,

        [id]
      );

    res.status(200).json(
      post.rows[0]
    );

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

module.exports = router;