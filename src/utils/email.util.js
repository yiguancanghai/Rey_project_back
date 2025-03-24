/**
 * Email utility functions
 */
const nodemailer = require('nodemailer');

/**
 * Create email transporter
 * @returns {Object} Nodemailer transporter
 */
const createTransporter = () => {
  // For testing or development environments, use a test account
  if (process.env.NODE_ENV === 'test') {
    return {
      sendMail: async () => {
        return {
          accepted: ['test@example.com'],
          messageId: 'test-message-id'
        };
      }
    };
  }

  // For development without actual email config
  if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_SERVICE) {
    console.log('Email service not configured. Using mock transporter.');
    return {
      sendMail: async (mailOptions) => {
        console.log('Mock email sent:');
        console.log('To:', mailOptions.to);
        console.log('Subject:', mailOptions.subject);
        console.log('Body:', mailOptions.text || mailOptions.html);
        return {
          accepted: [mailOptions.to],
          messageId: 'mock-message-id'
        };
      }
    };
  }

  // Create real email transporter for production
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text email body
 * @param {string} options.html - HTML email body (optional)
 * @returns {Promise<Object>} Email send result
 */
const sendEmail = async (options) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@example.com',
    to: options.to || process.env.EMAIL_TO,
    subject: options.subject,
    text: options.text
  };
  
  if (options.html) {
    mailOptions.html = options.html;
  }
  
  try {
    const result = await transporter.sendMail(mailOptions);
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

/**
 * Send contact form email
 * @param {Object} contact - Contact form data
 * @returns {Promise} Email send result
 */
exports.sendContactEmail = async (contact) => {
  const subject = `Portfolio Contact: ${contact.subject}`;
  
  const html = `
    <h2>New Contact Form Submission</h2>
    <p><strong>Name:</strong> ${contact.name}</p>
    <p><strong>Email:</strong> ${contact.email}</p>
    <p><strong>Subject:</strong> ${contact.subject}</p>
    <p><strong>Message:</strong></p>
    <div>${contact.message}</div>
    <hr>
    <p><small>Submitted on: ${new Date().toLocaleString()}</small></p>
  `;

  const text = `
    New Contact Form Submission
    
    Name: ${contact.name}
    Email: ${contact.email}
    Subject: ${contact.subject}
    
    Message:
    ${contact.message}
    
    Submitted on: ${new Date().toLocaleString()}
  `;

  return await this.sendEmail({
    subject,
    text,
    html
  });
};

module.exports = {
  sendEmail
}; 