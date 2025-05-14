const Order = require('../models/order');
const User = require('../models/User');
const { publishMessage, ROUTING_KEYS } = require('../config/rabbitmq');
const { validationResult } = require('express-validator');

exports.getAllOrders = async (req, res) => {
  try {
    const users = await User.find({ assignedAdmin: req.user.id }).select('_id');
    const userIds = users.map(user => user._id);

    const orders = await Order.find({ user: { $in: userIds } })
      .populate('user', 'name email phone location')
      .select('-__v')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return res.status(404).json({ msg: 'Order not found' });

    const user = await User.findOne({ _id: order.user._id, assignedAdmin: req.user.id });
    if (!user) return res.status(404).json({ msg: 'Not authorized to view this order' });

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getOrdersByCustomer = async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.userId,
      assignedAdmin: req.user.id
    });

    if (!user) return res.status(404).json({ msg: 'Customer not found or not authorized' });

    const orders = await Order.find({ user: req.params.userId })
      .select('-__v')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.createOrder = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const user = await User.findOne({
      _id: req.body.user,
      assignedAdmin: req.user.id
    });

    if (!user) return res.status(404).json({ msg: 'Customer not found or not authorized' });

    if (!req.body.orderNumber) {
      req.body.orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }

    const message = { ...req.body };

    await publishMessage(req.app.get('rabbitMQChannel'), ROUTING_KEYS.ORDER_CREATE, message);

    res.status(202).json({
      msg: 'Order creation in progress',
      order: {
        orderNumber: req.body.orderNumber,
        user: req.body.user,
        totalAmount: req.body.totalAmount,
        status: req.body.status || 'pending'
      }
    });
  } catch (err) {
    console.error('Error in order creation:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.updateOrder = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const order = await Order.findById(req.params.id).populate('user');
    if (!order) return res.status(404).json({ msg: 'Order not found' });

    const user = await User.findOne({
      _id: order.user,
      assignedAdmin: req.user.id
    });
    if (!user) return res.status(404).json({ msg: 'Not authorized to update this order' });

    const message = {
      id: req.params.id,
      ...req.body
    };

    await publishMessage(req.app.get('rabbitMQChannel'), ROUTING_KEYS.ORDER_UPDATE, message);

    res.status(202).json({
      msg: 'Order update in progress',
      order: {
        id: req.params.id,
        updates: req.body
      }
    });
  } catch (err) {
    console.error('Error in order update:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};