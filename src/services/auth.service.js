const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const authRepository =
  require("../repositories/auth.repository");

const signup = async (data) => {

  const {
    username,
    email,
    mobile,
    password,
  } = data;

  // CHECK EXISTING USER
  const existingUser =
    await authRepository.findExistingUser(
      email,
      username,
      mobile
    );

  if (existingUser.rows.length > 0) {
    throw new Error("User already exists");
  }

  // HASH PASSWORD
  const hashedPassword =
    await bcrypt.hash(password, 10);

  // CREATE USER
  const newUser =
    await authRepository.createUser({
      username,
      email,
      mobile,
      password: hashedPassword,
    });

  // CREATE TOKEN
  const token = jwt.sign(
    { id: newUser.rows[0].id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return {
    message: "Signup successful",
    token,
    user: newUser.rows[0],
  };
};

const login = async (data) => {

  const {
    identifier,
    password,
  } = data;

  // FIND USER
  const user =
    await authRepository.findUserByIdentifier(
      identifier
    );

  if (user.rows.length === 0) {
    throw new Error("User not found");
  }

  // CHECK PASSWORD
  const validPassword =
    await bcrypt.compare(
      password,
      user.rows[0].password
    );

  if (!validPassword) {
    throw new Error("Invalid password");
  }

  // CREATE TOKEN
  const token = jwt.sign(
    { id: user.rows[0].id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return {
    message: "Login successful",
    token,
    user: {
      id: user.rows[0].id,
      username: user.rows[0].username,
      email: user.rows[0].email,
      mobile: user.rows[0].mobile,
    },
  };
};


// GOOGLE USER
const getGoogleUser = async (email) => {

  const user =
    await authRepository.findGoogleUser(email);

  return {
    user:
      user.rows.length > 0
        ? user.rows[0]
        : null,
  };
};


// GOOGLE SIGNUP
const googleSignup = async (data) => {

  const {
    username,
    email,
    mobile,
    profile_pic,
  } = data;

  // CHECK EXISTING USER
  const existingUser =
    await authRepository.findGoogleUser(email);

  // EXISTING USER LOGIN
  if (existingUser.rows.length > 0) {

    const token = jwt.sign(
      { id: existingUser.rows[0].id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return {
      token,
      user: existingUser.rows[0],
    };
  }

  // HASH RANDOM PASSWORD
  const hashedPassword =
    await bcrypt.hash(
      "google_oauth_user",
      10
    );

  // CREATE USER
  const newUser =
    await authRepository.createGoogleUser({
      username,
      email,
      mobile,
      password: hashedPassword,
      profile_pic,
    });

  // CREATE TOKEN
  const token = jwt.sign(
    { id: newUser.rows[0].id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return {
    token,
    user: newUser.rows[0],
  };
};

module.exports = {
  signup,
  login,
  getGoogleUser,
  googleSignup,
};