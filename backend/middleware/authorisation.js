const jwt = require("jsonwebtoken");

// Check for the existence of the jwt secret (security net)
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

const authorisation = (req, res, next) => {
  // retrieve auth fron the request
  const authHeader = req.headers.authorization;

  // check if it exists and is in correct Bearer format
  if (!authHeader) {
    return res.status(401).json({
      error: true,
      message: "Authorization header ('Bearer token') not found",
    });
  }
  //separate 401 error for malformed token
  const parts = authHeader.split(" ");

  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({
      error: true,
      message: "Authorization header is malformed",
    }); // Checks that token is in the exact form: Bearer {token}
  }
  const token = parts[1]; // save the part after Bearer as the jwt

  try {
    // verify token with secret key
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ["HS256"], // use same algorithm that was used when creating token
    });
    // storing verification in variable, so the token email can be extracted
    req.user = decoded;

    next();
  } catch (error) {
    // detailed error handling
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ error: true, message: "JWT token has expired" });
    }
    // handle any other errors that may arise (invalid JWT tokens)
    return res.status(401).json({ error: true, message: "Invalid JWT token" });
  }
};

module.exports = authorisation;
