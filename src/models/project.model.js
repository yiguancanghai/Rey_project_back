const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    trim: true
  },
  shortDescription: {
    type: String,
    required: [true, 'Short description is required'],
    trim: true,
    maxlength: [200, 'Short description cannot be more than 200 characters']
  },
  technologies: [{
    type: String,
    required: true,
    trim: true
  }],
  projectType: {
    type: String,
    required: [true, 'Project type is required'],
    enum: ['AI', 'Web', 'Mobile', 'Other'],
    default: 'AI'
  },
  imageUrl: {
    type: String,
    required: [true, 'Project image URL is required']
  },
  additionalImages: [{
    type: String
  }],
  githubUrl: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || v.startsWith('https://github.com/');
      },
      message: 'GitHub URL must start with https://github.com/'
    }
  },
  demoUrl: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || v.startsWith('http');
      },
      message: 'Demo URL must be a valid URL'
    }
  },
  featured: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  content: {
    type: String,
    required: false
  },
  active: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for faster queries
projectSchema.index({ projectType: 1 });
projectSchema.index({ featured: 1 });
projectSchema.index({ order: 1 });

// Pre-find hook to only find active projects
projectSchema.pre(/^find/, function(next) {
  this.find({ active: { $ne: false } });
  next();
});

// Populate createdBy field on find
projectSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'createdBy',
    select: 'name'
  });
  next();
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project; 