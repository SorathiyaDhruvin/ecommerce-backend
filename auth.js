const express = require("express");
const {
  SignupUser,
  loginUser,
} = require("../controllers/authController");

const router = express.Router();

router.post("/signup", SignupUser);
router.post("/login", loginUser);

module.exports = router;
