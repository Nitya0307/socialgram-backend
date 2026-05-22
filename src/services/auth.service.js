const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const authRepository = require("../repositories/auth.repository");

const signup = async (data) => {

  const { username, email, mobile, password } = data;

  // CHECK EXISTING USER
  const existingUser = await authRepository.findExistingUser(
    email,
    username,
    mobile
  );

  if (existingUser.rows.length > 0) {
    throw new Error("User already exists");
  }

  // HASH PASSWORD
  const hashedPassword = await bcrypt.hash(password, 10);

  // CREATE USER
  const newUser = await authRepository.createUser({
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

  const { identifier, password } = data;

  // FIND USER
  const user = await authRepository.findUserByIdentifier(
    identifier
  );

  if (user.rows.length === 0) {
    throw new Error("User not found");
  }

  // CHECK PASSWORD
  const validPassword = await bcrypt.compare(
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

module.exports = {
  signup,
  login,
};