const express = require("express");
const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");
const {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

const router = express.Router();

// CREATE CATEGORY (Admin)
router.post("/", protect, adminOnly, createCategory);

// GET ALL CATEGORIES (Public)
router.get("/", getCategories);

// UPDATE CATEGORY (Admin)
router.put("/:id", protect, adminOnly, updateCategory);

// DELETE CATEGORY (Admin)
router.delete("/:id", protect, adminOnly, deleteCategory);

module.exports = router;
