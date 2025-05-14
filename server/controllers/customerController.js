const User = require('../models/User');
const Admin = require('../models/admin');
const { publishMessage, ROUTING_KEYS } = require('../config/rabbitmq');
const { validationResult } = require('express-validator');

exports.createCustomer = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, phone, status } = req.body;

  try {
    const existingCustomer = await User.findOne({ 
      email, 
      assignedAdmin: req.user.id 
    });
    
    if (existingCustomer) {
      return res.status(400).json({ msg: 'Customer with this email already exists under your account.' });
    }

    const message = {
      name,
      email,
      phone,
      status: status || 'new',
      assignedAdmin: req.user.id,
    };

    await publishMessage(req.app.get('rabbitMQChannel'), ROUTING_KEYS.CUSTOMER_CREATE, message);
    
    res.status(202).json({
      msg: 'Customer creation request accepted and queued for processing',
      customer: {
        name,
        email,
        phone,
        status: status || 'new',
      },
    });
  } catch (err) {
    console.error('Error in customer creation API:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.updateCustomer = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, phone, status } = req.body;

  try {
    const user = await User.findOne({ _id: req.params.id, assignedAdmin: req.user.id });
    if (!user) {
      return res.status(404).json({ msg: 'Customer not found or not authorized' });
    }

    const message = {
      id: req.params.id,
      name,
      email,
      phone,
      status,
      assignedAdmin: req.user.id,
    };

    await publishMessage(req.app.get('rabbitMQChannel'), ROUTING_KEYS.CUSTOMER_UPDATE, message);

    res.status(202).json({
      msg: 'Customer update in progress',
      customer: {
        id: req.params.id,
        updates: { name, email, phone, status },
      },
    });
  } catch (err) {
    console.error('Error in customer update API:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getAllCustomers = async (req, res) => {
  try {
    const users = await User.find({ assignedAdmin: req.user.id })
      .select('-__v')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getCustomerById = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id, assignedAdmin: req.user.id }).select('-__v')
    .populate('campaigns', 'name status createdAt message');
    if (!user) {
      return res.status(404).json({ msg: 'Customer not found or not authorized' });
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.deleteCustomer = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id, assignedAdmin: req.user.id });
    if (!user) {
      return res.status(404).json({ msg: 'Customer not found or not authorized' });
    }

    await Admin.findByIdAndUpdate(req.user.id, {
      $pull: { assignedUsers: user._id },
    });

    await user.remove();

    res.json({ msg: 'Customer removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};