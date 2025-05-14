const express = require('express');
const { check } = require('express-validator');
const { ensureAuth, ensureAdmin } = require('../middleware/auth');
const customerController = require('../controllers/customerController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Customers
 *   description: Customer management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Customer:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         phone:
 *           type: string
 *         status:
 *           type: string
 *           enum: [new, active, inactive]
 *         assignedAdmin:
 *           type: string
 */

router.post(
  '/',
  ensureAuth,
  ensureAdmin,
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('phone', 'Phone number is required').optional().isMobilePhone(),
  ],
  customerController.createCustomer
);

router.put(
  '/:id',
  ensureAuth,
  ensureAdmin,
  [
    check('name').optional().not().isEmpty(),
    check('email').optional().isEmail(),
    check('phone').optional().isMobilePhone(),
    check('status').optional().isIn(['new', 'active', 'inactive']),
  ],
  customerController.updateCustomer
);

router.get('/', ensureAuth, ensureAdmin, customerController.getAllCustomers);

router.get('/:id', ensureAuth, ensureAdmin, customerController.getCustomerById);

router.delete('/:id', ensureAuth, ensureAdmin, customerController.deleteCustomer);

module.exports = router;