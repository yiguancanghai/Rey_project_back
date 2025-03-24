const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authMiddleware.protect);
router.use(authMiddleware.restrictTo('admin'));

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Get admin dashboard stats
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/stats', async (req, res, next) => {
  try {
    // Here we would typically calculate various statistics
    // This is a placeholder implementation
    
    const stats = {
      projects: {
        total: 0,
        featured: 0,
        byType: {
          AI: 0,
          Web: 0,
          Mobile: 0,
          Other: 0
        }
      },
      contacts: {
        total: 0,
        new: 0,
        read: 0,
        replied: 0,
        spam: 0
      },
      terminalCommands: {
        total: 0,
        byType: {
          static: 0,
          dynamic: 0,
          alias: 0,
          ai: 0
        }
      },
      users: {
        total: 0,
        admins: 0,
        editors: 0
      }
    };
    
    // Import models only when needed to avoid circular dependencies
    const Project = require('../models/project.model');
    const Contact = require('../models/contact.model');
    const TerminalCommand = require('../models/terminal-command.model');
    const User = require('../models/user.model');
    
    // Get project stats
    stats.projects.total = await Project.countDocuments();
    stats.projects.featured = await Project.countDocuments({ featured: true });
    
    const projectsByType = await Project.aggregate([
      { $group: { _id: '$projectType', count: { $sum: 1 } } }
    ]);
    
    projectsByType.forEach(type => {
      stats.projects.byType[type._id] = type.count;
    });
    
    // Get contact stats
    stats.contacts.total = await Contact.countDocuments();
    
    const contactsByStatus = await Contact.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    contactsByStatus.forEach(status => {
      stats.contacts[status._id] = status.count;
    });
    
    // Get terminal command stats
    stats.terminalCommands.total = await TerminalCommand.countDocuments();
    
    const commandsByType = await TerminalCommand.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);
    
    commandsByType.forEach(type => {
      stats.terminalCommands.byType[type._id] = type.count;
    });
    
    // Get user stats
    stats.users.total = await User.countDocuments();
    
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    
    usersByRole.forEach(role => {
      stats.users[role._id + 's'] = role.count;
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        stats
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/admin/seed:
 *   post:
 *     summary: Seed the database with initial data (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Database seeded successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/seed', async (req, res, next) => {
  try {
    // This would seed initial data for development/testing
    // Should be used with caution in production
    
    const TerminalCommand = require('../models/terminal-command.model');
    
    // Create basic terminal commands if they don't exist
    const basicCommands = [
      {
        command: 'help',
        description: 'Show available commands',
        type: 'dynamic',
        category: 'system',
        order: 1,
        isActive: true
      },
      {
        command: 'clear',
        description: 'Clear the terminal screen',
        type: 'dynamic',
        category: 'system',
        order: 2,
        isActive: true
      },
      {
        command: 'about',
        description: 'Display information about me',
        response: 'Hi! I\'m Rey, an AI Engineer with expertise in machine learning, natural language processing, and web development.',
        type: 'static',
        category: 'about',
        order: 1,
        isActive: true
      },
      {
        command: 'skills',
        description: 'List my technical skills',
        type: 'dynamic',
        category: 'about',
        order: 2,
        isActive: true
      },
      {
        command: 'projects',
        description: 'List my projects',
        type: 'dynamic',
        category: 'project',
        order: 1,
        isActive: true
      },
      {
        command: 'contact',
        description: 'Show contact information',
        response: 'You can contact me at rey@example.com or use the contact form on this website.',
        type: 'static',
        category: 'about',
        order: 3,
        isActive: true
      },
      {
        command: 'ls',
        description: 'List projects (alias for projects)',
        aliasFor: 'projects',
        type: 'alias',
        category: 'project',
        order: 2,
        isActive: true
      },
      {
        command: 'hello',
        description: 'Say hello',
        response: 'Hello there! Type \'help\' to see available commands.',
        type: 'static',
        category: 'general',
        order: 1,
        isActive: true
      }
    ];
    
    // Upsert commands (update if exists, insert if not)
    for (const cmd of basicCommands) {
      await TerminalCommand.findOneAndUpdate(
        { command: cmd.command },
        cmd,
        { upsert: true, new: true }
      );
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Database seeded with initial data'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 