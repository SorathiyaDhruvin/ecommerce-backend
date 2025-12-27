const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  price: {
    type: Number, // snapshot price
    required: true,
  },
  itemTotal: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["placed", "cancelled", "returned"],
    default: "placed",
  },
  cancelledAt: Date,
  returnedAt: Date,
});


const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [orderItemSchema],

    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["placed", "shipped", "delivered", "cancelled"],
      default: "placed",
    },
    paymentMethod: {
      type: String,
      default: "COD",
    },
    paymentResult: {
      razorpayOrderId: String,
      razorpayPaymentId: String,
      razorpaySignature: String,
    },
    cancelReason: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
