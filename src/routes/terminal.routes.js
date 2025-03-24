const express = require('express');
const terminalController = require('../controllers/terminal.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * /api/terminal:
 *   post:
 *     summary: Process a terminal command
 *     tags: [Terminal]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - command
 *             properties:
 *               command:
 *                 type: string
 *     responses:
 *       200:
 *         description: Command processed successfully
 *       400:
 *         description: Bad request
 */
router.post('/', terminalController.processCommand);

// Protected routes requiring authentication
router.use('/commands', authMiddleware.protect);
router.use('/commands', authMiddleware.restrictTo('admin'));

/**
 * @swagger
 * /api/terminal/commands:
 *   get:
 *     summary: Get all terminal commands (admin only)
 *     tags: [Terminal]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of terminal commands
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/commands', terminalController.getAllCommands);

/**
 * @swagger
 * /api/terminal/commands/{id}:
 *   get:
 *     summary: Get a specific terminal command (admin only)
 *     tags: [Terminal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Terminal command ID
 *     responses:
 *       200:
 *         description: Terminal command details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Terminal command not found
 */
router.get('/commands/:id', terminalController.getCommand);

/**
 * @swagger
 * /api/terminal/commands:
 *   post:
 *     summary: Create a new terminal command (admin only)
 *     tags: [Terminal]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - command
 *               - type
 *             properties:
 *               command:
 *                 type: string
 *               description:
 *                 type: string
 *               response:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [static, dynamic, alias, ai]
 *               aliasFor:
 *                 type: string
 *               script:
 *                 type: string
 *               order:
 *                 type: integer
 *               category:
 *                 type: string
 *                 enum: [general, project, about, skill, fun, system]
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Terminal command created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       400:
 *         description: Bad request
 */
router.post('/commands', terminalController.createCommand);

/**
 * @swagger
 * /api/terminal/commands/{id}:
 *   patch:
 *     summary: Update a terminal command (admin only)
 *     tags: [Terminal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Terminal command ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               command:
 *                 type: string
 *               description:
 *                 type: string
 *               response:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [static, dynamic, alias, ai]
 *               aliasFor:
 *                 type: string
 *               script:
 *                 type: string
 *               order:
 *                 type: integer
 *               category:
 *                 type: string
 *                 enum: [general, project, about, skill, fun, system]
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Terminal command updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Terminal command not found
 */
router.patch('/commands/:id', terminalController.updateCommand);

/**
 * @swagger
 * /api/terminal/commands/{id}:
 *   delete:
 *     summary: Delete a terminal command (admin only)
 *     tags: [Terminal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Terminal command ID
 *     responses:
 *       204:
 *         description: Terminal command deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Terminal command not found
 */
router.delete('/commands/:id', terminalController.deleteCommand);

module.exports = router; 