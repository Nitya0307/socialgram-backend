const pool = require("../config/db");

const findExistingUser = async (
  email,
  username,
  mobile
) => {

  return await pool.query(
    `
    SELECT *
    FROM users
    WHERE email = $1
    OR username = $2
    OR mobile = $3
    `,
    [email, username, mobile]
  );
};

const createUser = async ({
  username,
  email,
  mobile,
  password,
}) => {

  return await pool.query(
    `
    INSERT INTO users
    (
      username,
      email,
      mobile,
      password
    )

    VALUES ($1, $2, $3, $4)

    RETURNING
    id,
    username,
    email,
    mobile
    `,
    [username, email, mobile, password]
  );
};

const findUserByIdentifier = async (
  identifier
) => {

  return await pool.query(
    `
    SELECT *
    FROM users
    WHERE email = $1
    OR username = $1
    OR mobile = $1
    `,
    [identifier]
  );
};

module.exports = {
  findExistingUser,
  createUser,
  findUserByIdentifier,
};