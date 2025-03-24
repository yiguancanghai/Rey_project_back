/**
 * Utility for reCAPTCHA verification
 */
const axios = require('axios');
const { BadRequestError } = require('./error.util');

const RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';

/**
 * Verify reCAPTCHA token
 * @param {string} token - reCAPTCHA token from client
 * @returns {Promise<boolean>} - True if verification is successful
 * @throws {BadRequestError} - If verification fails
 */
const verifyRecaptcha = async (token) => {
  if (!token) {
    throw new BadRequestError('reCAPTCHA token is required');
  }

  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    
    // Skip verification in test environment
    if (process.env.NODE_ENV === 'test') {
      return true;
    }
    
    const params = new URLSearchParams();
    params.append('secret', secretKey);
    params.append('response', token);
    
    const response = await axios.post(RECAPTCHA_VERIFY_URL, params);
    
    if (!response.data.success) {
      throw new BadRequestError('reCAPTCHA verification failed');
    }
    
    return true;
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    throw new BadRequestError('reCAPTCHA verification failed');
  }
};

module.exports = {
  verifyRecaptcha
}; 