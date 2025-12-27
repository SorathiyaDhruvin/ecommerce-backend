const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  addToCart,
  getCart,
  removeFromCart,
  updateQuantity
} = require("../controllers/cartController");
const { decreaseQuantity } = require("../controllers/cartController");
const router = express.Router();
router.post("/add", protect, addToCart);
router.get("/", protect, getCart);
router.delete("/:productId", protect, removeFromCart);
router.put("/update-quantity", protect, updateQuantity);
router.put("/decrease/:productId", protect, decreaseQuantity);
module.exports = router;
