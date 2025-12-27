const Cart = require("../models/Cart");
const Product = require("../models/Product");

// ADD TO CART
exports.addToCart = async (req, res) => {
  const { productId, quantity } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = await Cart.create({
      user: req.user._id,
      items: [
        {
          product: productId,
          quantity,
          price: product.price, // ✅ SNAPSHOT
        },
      ],
    });
  } else {
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({
        product: productId,
        quantity,
        price: product.price, // ✅ SNAPSHOT
      });
    }

    await cart.save();
  }

  res.json(cart);
};


// GET USER CART
exports.getCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id })
    .populate("items.product", "title price image");

  res.json(cart);
};


// UPDATE QUANTITY (increase / set quantity)
exports.updateQuantity = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user._id;

    if (!productId || quantity === undefined) {
      return res.status(400).json({ message: "productId & quantity required" });
    }

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.find((item) => {
      const id =
        typeof item.product === "object"
          ? item.product._id.toString()
          : item.product.toString();

      return id === productId;
    });

    if (!item) {
      return res.status(404).json({ message: "Item not in cart" });
    }

    // AMAZON STYLE
    if (quantity <= 0) {
      cart.items = cart.items.filter((item) => {
        const id =
          typeof item.product === "object"
            ? item.product._id.toString()
            : item.product.toString();

        return id !== productId;
      });
    } else {
      item.quantity = quantity;
    }

    await cart.save();
    res.status(200).json(cart);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// REMOVE ITEM
exports.removeFromCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== req.params.productId
  );

  await cart.save();
  res.json(cart);
};


// DECREASE QUANTITY BY 1
exports.decreaseQuantity = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    return res.status(404).json({ message: "Cart not found" });
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === req.params.productId
  );

  if (itemIndex === -1) {
    return res.status(404).json({ message: "Item not found in cart" });
  }

  // decrease quantity
  cart.items[itemIndex].quantity -= 1;

  // if quantity becomes 0, remove item
  if (cart.items[itemIndex].quantity <= 0) {
    cart.items.splice(itemIndex, 1);
  }

  await cart.save();
  res.json(cart);
};
