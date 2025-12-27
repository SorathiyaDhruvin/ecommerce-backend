const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    brand: {
      type: String,
      required: true,
    },
    mrp: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    discountPercent: {
      type: Number,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subCategory: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    highlights: {
      type: [String],
      required: true,
    },
    stock: {
      type: Number,
      default: 0,
    },
    availability: {
      type: String,
      enum: ["in stock", "out of stock"],
      default: "in stock",
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    emiAvailable: {
      type: Boolean,
      default: false,
    },
    warranty: {
      type: String,
      required: true,
    },
    images: [
      {
        type: String,
      },
    ],

  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
