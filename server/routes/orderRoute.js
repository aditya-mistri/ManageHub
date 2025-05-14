const express = require('express');
const { check } = require('express-validator');
const { ensureAuth, ensureAdmin } = require('../middleware/auth');
const orderController = require('../controllers/orderController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     OrderItem:
 *       type: object
 *       required:
 *         - name
 *         - quantity
 *         - price
 *       properties:
 *         name:
 *           type: string
 *         quantity:
 *           type: number
 *         price:
 *           type: number
 *     Order:
 *       type: object
 *       required:
 *         - user
 *         - items
 *         - totalAmount
 *       properties:
 *         user:
 *           type: string
 *         orderNumber:
 *           type: string
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *         totalAmount:
 *           type: number
 *         status:
 *           type: string
 *           enum: [pending, processing, shipped, delivered, cancelled]
 *         paymentStatus:
 *           type: string
 *           enum: [pending, paid, failed, refunded]
 *         shippingAddress:
 *           type: object
 *         deliveryDate:
 *           type: string
 *           format: date-time
 *         notes:
 *           type: string
 */

router.get('/', ensureAuth, ensureAdmin, orderController.getAllOrders);

router.get('/:id', ensureAuth, ensureAdmin, orderController.getOrderById);

router.get('/customer/:userId', ensureAuth, ensureAdmin, orderController.getOrdersByCustomer);

router.post(
  '/',
  ensureAuth,
  ensureAdmin,
  [
    check('user', 'User ID is required').not().isEmpty(),
    check('items', 'Items are required').isArray({ min: 1 }),
    check('items.*.name', 'Item name is required').not().isEmpty(),
    check('items.*.quantity', 'Quantity must be positive').isInt({ min: 1 }),
    check('items.*.price', 'Price must be positive').isFloat({ min: 0 }),
    check('totalAmount', 'Total amount must be positive').isFloat({ min: 0 }),
    check('status').optional().isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
    check('paymentStatus').optional().isIn(['pending', 'paid', 'failed', 'refunded']),
    check('deliveryDate').optional().isISO8601(),
    check('notes').optional().isString().isLength({ max: 1000 }),
  ],
  orderController.createOrder
);

router.put(
  '/:id',
  ensureAuth,
  ensureAdmin,
  [
    check('status').optional().isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
    check('paymentStatus').optional().isIn(['pending', 'paid', 'failed', 'refunded']),
    check('deliveryDate').optional().isISO8601(),
    check('notes').optional().isString().isLength({ max: 1000 }),
  ],
  orderController.updateOrder
);

module.exports = router;