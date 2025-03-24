const Project = require('../models/project.model');
const { AppError } = require('../utils/error.util');
const { uploadImage, getFileUrl, deleteFile } = require('../utils/upload.util');
const path = require('path');

/**
 * Get all projects
 * @route GET /api/projects
 */
exports.getAllProjects = async (req, res, next) => {
  try {
    // Build query with filters
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(field => delete queryObj[field]);

    // Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    
    // Build query
    let query = Project.find(JSON.parse(queryStr));

    // Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-featured order');
    }

    // Field limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    // Execute query
    const projects = await query;
    const total = await Project.countDocuments(JSON.parse(queryStr));

    res.status(200).json({
      status: 'success',
      results: projects.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: {
        projects
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a specific project by ID or slug
 * @route GET /api/projects/:id
 */
exports.getProject = async (req, res, next) => {
  try {
    const query = {};
    
    // Check if the parameter is an ObjectId or a slug
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      query._id = req.params.id;
    } else {
      query.slug = req.params.id;
    }
    
    const project = await Project.findOne(query);

    if (!project) {
      return next(new AppError('No project found with that ID or slug', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        project
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new project
 * @route POST /api/projects
 */
exports.createProject = async (req, res, next) => {
  try {
    // Generate slug from title if not provided
    if (!req.body.slug && req.body.title) {
      req.body.slug = req.body.title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    // Add the current user as the creator
    if (req.user) {
      req.body.createdBy = req.user._id;
    }

    const newProject = await Project.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        project: newProject
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a project
 * @route PATCH /api/projects/:id
 */
exports.updateProject = async (req, res, next) => {
  try {
    // Generate slug from title if title is being updated and slug is not provided
    if (req.body.title && !req.body.slug) {
      req.body.slug = req.body.title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!project) {
      return next(new AppError('No project found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        project
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a project
 * @route DELETE /api/projects/:id
 */
exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return next(new AppError('No project found with that ID', 404));
    }

    // Delete associated image files
    if (project.imageUrl) {
      const filename = path.basename(project.imageUrl);
      deleteFile(filename);
    }

    if (project.additionalImages && project.additionalImages.length > 0) {
      project.additionalImages.forEach(image => {
        const filename = path.basename(image);
        deleteFile(filename);
      });
    }

    await Project.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload project image
 * @route POST /api/projects/:id/image
 */
exports.uploadProjectImage = async (req, res, next) => {
  try {
    const upload = uploadImage.single('image');

    upload(req, res, async (err) => {
      if (err) {
        return next(new AppError(err.message, 400));
      }

      if (req.fileValidationError) {
        return next(new AppError(req.fileValidationError, 400));
      }

      if (!req.file) {
        return next(new AppError('Please upload an image file', 400));
      }

      // Get the project
      const project = await Project.findById(req.params.id);

      if (!project) {
        return next(new AppError('No project found with that ID', 404));
      }

      // If project already has an image, delete the old one
      if (project.imageUrl) {
        const oldFilename = path.basename(project.imageUrl);
        deleteFile(oldFilename);
      }

      // Update project with new image URL
      const imageUrl = getFileUrl(req.file.filename);
      
      const updatedProject = await Project.findByIdAndUpdate(
        req.params.id,
        { imageUrl },
        {
          new: true,
          runValidators: true
        }
      );

      res.status(200).json({
        status: 'success',
        data: {
          project: updatedProject
        }
      });
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload additional project images
 * @route POST /api/projects/:id/images
 */
exports.uploadAdditionalImages = async (req, res, next) => {
  try {
    const upload = uploadImage.array('images', 5); // Allow up to 5 images

    upload(req, res, async (err) => {
      if (err) {
        return next(new AppError(err.message, 400));
      }

      if (req.fileValidationError) {
        return next(new AppError(req.fileValidationError, 400));
      }

      if (!req.files || req.files.length === 0) {
        return next(new AppError('Please upload at least one image file', 400));
      }

      // Get the project
      const project = await Project.findById(req.params.id);

      if (!project) {
        return next(new AppError('No project found with that ID', 404));
      }

      // Generate URLs for the new images
      const newImageUrls = req.files.map(file => getFileUrl(file.filename));
      
      // Combine with existing images if any
      const additionalImages = [
        ...(project.additionalImages || []),
        ...newImageUrls
      ];

      const updatedProject = await Project.findByIdAndUpdate(
        req.params.id,
        { additionalImages },
        {
          new: true,
          runValidators: true
        }
      );

      res.status(200).json({
        status: 'success',
        data: {
          project: updatedProject
        }
      });
    });
  } catch (error) {
    next(error);
  }
}; 