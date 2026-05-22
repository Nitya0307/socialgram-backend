const authService = require("../services/auth.service");

const signup = async (req, res) => {
  try {

    const result = await authService.signup(req.body);

    res.status(201).json(result);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: error.message || "Server error",
    });
  }
};

const login = async (req, res) => {
  try {

    const result = await authService.login(req.body);

    res.json(result);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: error.message || "Server error",
    });
  }
};

module.exports = {
  signup,
  login,
};
