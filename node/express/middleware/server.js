const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();
const port = 3000;

const JWT_SECRET = "your_very_secret_key_12345";

const users = [
  { id: 101, username: "a", password: "123", role: "admin" },
  { id: 102, username: "b", password: "123", role: "user" },
];

app.use(express.json());

function auth(req, res, next) {
  const authHeader = req.headers["authorization"];

  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res
      .status(401)
      .json({ message: "Access Denied. No token provided." });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error("JWT Verification Error:", err.message);
      return res.status(403).json({ message: "Invalid or expired token." });
    }

    req.user = user;
    next();
  });
}

app.get("/api/guest", (req, res) => {
  res.json({ message: "Guest Login." });
});

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find((u) => u.username === username);

  if (!user || user.password !== password) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  const payload = {
    id: user.id,
    username: user.username,
    role: user.role,
  };

  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: "8h",
  });

  res.json({
    message: "Login successful",
    token: token,
    expiresIn: "8 hour",
  });
});

app.get("/api/user", auth, (req, res) => {
  res.json({
    message: "User login!",
    data: {
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      status: "Authorized",
    },
  });
});

const admincheck = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Forbidden. Admin access required." });
  }
  next();
};
app.get("/api/admin", auth, admincheck, (req, res) => {
  res.json({
    message: "Admin login !",
    userDetails: req.user,
  });
});

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
