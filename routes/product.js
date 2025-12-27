const express = require("express");
const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const upload = require("../middleware/uploadMiddleware");
const router = express.Router();
router.post(
  "/",
  protect,
  adminOnly,
  upload.array("image",200),
  createProduct
);
router.post("/", protect, adminOnly, createProduct);
router.get("/", getProducts);
router.get("/:id", getProductById);
router.put("/:id", protect, adminOnly, updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);

module.exports = router;
