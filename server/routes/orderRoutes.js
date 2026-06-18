import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
router.post('/', protect, async (req, res, next) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      specificRequirements,
      totalPrice,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      res.status(400);
      throw new Error('No order items');
    }

    // Double check stock levels and decrement them
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        res.status(404);
        throw new Error(`Product not found: ${item.name}`);
      }
      if (product.countInStock < item.qty) {
        res.status(400);
        throw new Error(`Insufficient stock for product: ${item.name}`);
      }
      // Decrement stock
      product.countInStock -= item.qty;
      await product.save();
    }

    const order = new Order({
      orderItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      specificRequirements,
      totalPrice,
      isPaid: true, // For simplification in ShopEZ, assume immediate payment
      paidAt: Date.now(),
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    next(error);
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
router.get('/myorders', protect, async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (order) {
      // Check if user is order owner or admin
      if (
        order.user._id.toString() !== req.user._id.toString() &&
        !req.user.isAdmin
      ) {
        res.status(403);
        throw new Error('Not authorized to view this order');
      }
      res.json(order);
    } else {
      res.status(404);
      throw new Error('Order not found');
    }
  } catch (error) {
    next(error);
  }
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
router.get('/', protect, adminOnly, async (req, res, next) => {
  try {
    const orders = await Order.find({}).populate('user', 'id name').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
router.put('/:id/status', protect, adminOnly, async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (order) {
      const previousStatus = order.status;

      // Transition validations:
      // (i) Returned status is only available if current status is delivered
      if (status === 'returned' && previousStatus !== 'delivered') {
        res.status(400);
        throw new Error('Order must be delivered before it can be marked as returned');
      }

      // (ii) Delivered status is not available once an order is cancelled
      if (status === 'delivered' && previousStatus === 'cancelled') {
        res.status(400);
        throw new Error('Cancelled orders cannot be marked as delivered');
      }

      // If already cancelled or returned, restrict further modifications (terminal states)
      if (previousStatus === 'cancelled' && status !== 'cancelled') {
        res.status(400);
        throw new Error('Cancelled orders cannot have their status changed');
      }
      if (previousStatus === 'returned' && status !== 'returned') {
        res.status(400);
        throw new Error('Returned orders cannot have their status changed');
      }

      order.status = status;
      if (status === 'delivered') {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
      } else if (status === 'cancelled' || status === 'returned') {
        // Quantity must be replenished once an order is returned or cancelled
        if (previousStatus !== 'cancelled' && previousStatus !== 'returned') {
          for (const item of order.orderItems) {
            const product = await Product.findById(item.product);
            if (product) {
              product.countInStock += item.qty;
              await product.save();
            }
          }
        }
      }

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404);
      throw new Error('Order not found');
    }
  } catch (error) {
    next(error);
  }
});

// @desc    Cancel an order by user
// @route   PUT /api/orders/:id/cancel
// @access  Private
router.put('/:id/cancel', protect, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      // Check ownership
      if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
        res.status(403);
        throw new Error('Not authorized to cancel this order');
      }

      const previousStatus = order.status;

      // Can only cancel if placed or shipped
      if (previousStatus !== 'placed' && previousStatus !== 'shipped') {
        res.status(400);
        throw new Error(`Cannot cancel order in '${previousStatus}' state. Only 'placed' or 'shipped' orders can be cancelled.`);
      }

      order.status = 'cancelled';

      // Replenish stock
      for (const item of order.orderItems) {
        const product = await Product.findById(item.product);
        if (product) {
          product.countInStock += item.qty;
          await product.save();
        }
      }

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404);
      throw new Error('Order not found');
    }
  } catch (error) {
    next(error);
  }
});

export default router;
