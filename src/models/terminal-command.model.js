const mongoose = require('mongoose');

const terminalCommandSchema = new mongoose.Schema({
  command: {
    type: String,
    required: [true, 'Command is required'],
    trim: true
  },
  description: {
    type: String,
    required: false,
    trim: true
  },
  response: {
    type: String,
    required: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  type: {
    type: String,
    enum: ['static', 'dynamic', 'alias', 'ai'],
    default: 'static'
  },
  aliasFor: {
    type: String,
    required: false
  },
  script: {
    type: String,
    required: false
  },
  order: {
    type: Number,
    default: 0
  },
  category: {
    type: String,
    enum: ['general', 'project', 'about', 'skill', 'fun', 'system'],
    default: 'general'
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: false
  }
}, {
  timestamps: true
});

// Indexes for faster lookups
terminalCommandSchema.index({ command: 1 }, { unique: true });
terminalCommandSchema.index({ category: 1 });
terminalCommandSchema.index({ isActive: 1 });

const TerminalCommand = mongoose.model('TerminalCommand', terminalCommandSchema);

module.exports = TerminalCommand; 