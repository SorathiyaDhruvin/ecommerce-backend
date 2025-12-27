const crypto = require("crypto");
const razorpay = require("../config/razorpay");
const Order = require("../models/Order");

// CREATE RAZORPAY ORDER
exports.createRazorpayOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.body.orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const options = {
      amount: order.totalAmount * 100, // in paise
      currency: "INR",
      receipt: `order_rcptid_${order._id}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    res.json(razorpayOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// VERIFY PAYMENT
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    const order = await Order.findById(orderId);

    order.paymentStatus = "paid";
    order.paymentMethod = "ONLINE";
    order.paymentResult = {
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
    };

    await order.save();

    res.json({ message: "Payment successful", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
