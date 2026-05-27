import express from 'express';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import {protect, adminOnly} from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, async (req, res) => {
  try {
    const{items, totalAmount, paymentMethod, deliveryAddress,  deliveryMethod, momoNumber,notes} = req.body;
    const order = new Order({
      userId: req.user.id,
      items,
      totalAmount,
      paymentMethod,
      deliveryMethod,
      deliveryAddress,
      momoNumber,
      notes
    });
    await order.save();

    await Cart.findOneAndUpdate(
      { userId: req.user.id },
      {items: [] },
    );

    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (error) {
    res.status(500).json({ message: 'Error placing order', error: error.message });
  } 
});

router.get('/myorders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
});

router.get('/', protect, adminOnly, async (req, res) => { 
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).populate('userId', 'name email');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
});

router.put('/:id/status', protect, adminOnly, async (req, res) => {
  try {
  const order= await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });

res.json({message:'order updated successfully', order});
  } catch (error) {
    res.status(500).json({ message: 'Error updating order', error: error.message });
  }
});

export default router;