const express = require("express");

const {
  signup,
  login,
  getGoogleUser,
  googleSignup,
} = require("../controllers/auth.controller");

const router = express.Router();

// ROUTES
router.post("/signup", signup);

router.post("/login", login);

router.get("/google-user", getGoogleUser);

router.post("/google-signup", googleSignup);

module.exports = router;