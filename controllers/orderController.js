const Order = require("../models/Order");
const Cart = require("../models/Cart");

// PLACE ORDER
exports.placeOrder = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product",
      "price"
    );

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const items = cart.items.map(item => ({
      product: item.product._id,
      quantity: item.quantity,
      price: item.price,               // ✅ FROM CART
      itemTotal: item.price * item.quantity,
      status: "placed",
    }));

    const totalAmount = items.reduce(
      (sum, item) => sum + item.itemTotal,
      0
    );

    const order = await Order.create({
      user: req.user._id,
      items,
      totalAmount,
      paymentMethod: req.body.paymentMethod || "COD",
    });

    cart.items = [];
    await cart.save();

    res.status(201).json(order);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// GET USER ORDERS
exports.getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate("items.product", "title images price")
    .sort({ createdAt: -1 });

  res.json(orders);
};

// GET SINGLE ORDER
exports.getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    "items.product",
    "title images price"
  );

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  res.json(order);
};

// ADMIN: GET ALL ORDERS
exports.getAllOrders = async (req, res) => {
  const orders = await Order.find()
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  res.json(orders);
};

// ADMIN: UPDATE ORDER STATUS
exports.updateOrderStatus = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  order.status = req.body.status || order.status;
  await order.save();

  res.json(order);
};



// CANCEL SINGLE ITEM (Amazon style)
exports.cancelOrderItem = async (req, res) => {
  try {
    const { orderId, productId } = req.params;
    const userId = req.user._id;

    const order = await Order.findOne({
      _id: orderId,
      user: userId,
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const item = order.items.find(
      item => item.product.toString() === productId
    );

    if (!item) {
      return res.status(404).json({ message: "Item not found in order" });
    }

    if (item.status === "cancelled") {
      return res.status(400).json({ message: "Item already cancelled" });
    }

    // ✅ Cancel item
    item.status = "cancelled";
    item.cancelledAt = new Date();

    // ✅ Recalculate total (ONLY placed items)
    order.totalAmount = order.items
      .filter(item => item.status === "placed")
      .reduce((sum, item) => sum + item.itemTotal, 0);

    // ✅ Cancel whole order if all items cancelled
    const allCancelled = order.items.every(
      item => item.status === "cancelled"
    );

    if (allCancelled) {
      order.status = "cancelled";
    }

    await order.save();

    res.status(200).json({
      message: "Item cancelled successfully",
      order,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
