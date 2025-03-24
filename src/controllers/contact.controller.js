const Contact = require('../models/contact.model');
const { AppError } = require('../utils/error.util');
const { sendContactEmail } = require('../utils/email.util');
const { verifyRecaptcha } = require('../utils/recaptcha.util');

/**
 * Submit contact form
 * @route POST /api/contact
 */
exports.submitContactForm = async (req, res, next) => {
  try {
    const { name, email, subject, message, recaptchaToken } = req.body;

    // Verify reCAPTCHA token if provided
    if (process.env.NODE_ENV === 'production' && recaptchaToken) {
      const recaptchaValid = await verifyRecaptcha(
        recaptchaToken, 
        req.ip
      );
      
      if (!recaptchaValid) {
        return next(new AppError('reCAPTCHA verification failed', 400));
      }
    }

    // Create contact record
    const contact = await Contact.create({
      name,
      email,
      subject,
      message,
      recaptchaToken,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    // Send email notification
    await sendContactEmail(contact);

    res.status(201).json({
      status: 'success',
      message: 'Contact form submitted successfully',
      data: {
        id: contact._id
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all contact form submissions (admin only)
 * @route GET /api/contact
 */
exports.getAllContacts = async (req, res, next) => {
  try {
    // Build query with filters
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(field => delete queryObj[field]);

    // Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    
    // Build query
    let query = Contact.find(JSON.parse(queryStr));

    // Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
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
    const contacts = await query;
    const total = await Contact.countDocuments(JSON.parse(queryStr));

    res.status(200).json({
      status: 'success',
      results: contacts.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: {
        contacts
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a specific contact by ID (admin only)
 * @route GET /api/contact/:id
 */
exports.getContact = async (req, res, next) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return next(new AppError('No contact found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        contact
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update contact status (admin only)
 * @route PATCH /api/contact/:id
 */
exports.updateContact = async (req, res, next) => {
  try {
    // Only allow updating specific fields
    const allowedFields = ['status', 'replied'];
    const updateData = {};
    
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updateData[key] = req.body[key];
      }
    });
    
    // If marking as replied, add reply date
    if (updateData.replied) {
      updateData.replyDate = Date.now();
    }

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

    if (!contact) {
      return next(new AppError('No contact found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        contact
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a contact (admin only)
 * @route DELETE /api/contact/:id
 */
exports.deleteContact = async (req, res, next) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return next(new AppError('No contact found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
}; 