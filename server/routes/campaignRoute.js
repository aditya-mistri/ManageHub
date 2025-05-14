const express = require('express');
const { check } = require('express-validator');
const { ensureAuth, ensureAdmin } = require('../middleware/auth');
const campaignController = require('../controllers/campaignController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Campaigns
 *   description: Campaign management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Rule:
 *       type: object
 *       properties:
 *         field:
 *           type: string
 *         operator:
 *           type: string
 *           enum: [">", "<", ">=", "<=", "==", "!="]
 *         value:
 *           type: string
 *     RuleGroup:
 *       type: object
 *       properties:
 *         operator:
 *           type: string
 *           enum: ["AND", "OR"]
 *         rules:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Rule'
 *     Campaign:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         segments:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/RuleGroup'
 *         scheduledAt:
 *           type: string
 *           format: date-time
 *         audienceSize:
 *           type: number
 *         audienceUserIds:
 *           type: array
 *           items:
 *             type: string
 *         stats:
 *           type: object
 *           properties:
 *             sent:
 *               type: number
 *             failed:
 *               type: number
 *             audienceSize:
 *               type: number
 */

router.post('/segments/preview',ensureAuth , ensureAdmin, campaignController.previewAudience);

router.post(
  '/',
  ensureAuth,
  ensureAdmin,
  [
    check('name', 'Campaign name is required').not().isEmpty(),
    check('segments', 'Segments are required').isArray({ min: 1 }),
  ],
  campaignController.createCampaign
);

router.get('/', ensureAuth, ensureAdmin, campaignController.getAllCampaigns);

router.get('/:id', ensureAuth, ensureAdmin, campaignController.getCampaignById);

router.post('/:id/insight', ensureAuth, ensureAdmin, campaignController.generateCampaignInsight);

module.exports = router;