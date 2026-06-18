import express from 'express';
import Cart from '../models/Cart.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    res.json(cart);
  } catch (error) {
    next(error);
  }
});

// @desc    Save/Sync cart items
// @route   POST /api/cart
// @access  Private
router.post('/', protect, async (req, res, next) => {
  try {
    const { items } = req.body; // Array of { product: id, qty: num }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({ user: req.user._id, items });
    } else {
      cart.items = items;
    }

    await cart.save();
    const populatedCart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    res.json(populatedCart);
  } catch (error) {
    next(error);
  }
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
router.delete('/:productId', protect, async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (cart) {
      cart.items = cart.items.filter(
        (item) => item.product.toString() !== req.params.productId
      );
      await cart.save();
      const populatedCart = await Cart.findOne({ user: req.user._id }).populate('items.product');
      res.json(populatedCart);
    } else {
      res.status(404);
      throw new Error('Cart not found');
    }
  } catch (error) {
    next(error);
  }
});

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
router.delete('/', protect, async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (cart) {
      cart.items = [];
      await cart.save();
      res.json(cart);
    } else {
      res.status(404);
      throw new Error('Cart not found');
    }
  } catch (error) {
    next(error);
  }
});

export default router;
