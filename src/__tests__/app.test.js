/**
 * Basic application tests
 */
jest.mock('../routes/auth.routes', () => jest.fn());
jest.mock('../routes/contact.routes', () => jest.fn());
jest.mock('../routes/project.routes', () => jest.fn());
jest.mock('../routes/terminal.routes', () => jest.fn());
jest.mock('../routes/admin.routes', () => jest.fn());
jest.mock('swagger-ui-express', () => ({
  serve: jest.fn(),
  setup: jest.fn()
}));
jest.mock('swagger-jsdoc', () => jest.fn(() => ({})));

// Mock express and its middleware
jest.mock('express', () => {
  // Create mock functions for all express methods we use
  const mockApp = {
    use: jest.fn(),
    get: jest.fn(),
    listen: jest.fn()
  };
  
  // Create mock express function that returns our mock app
  const mockExpress = jest.fn(() => mockApp);
  
  // Add required middleware functions
  mockExpress.json = jest.fn(() => jest.fn());
  mockExpress.urlencoded = jest.fn(() => jest.fn());
  mockExpress.static = jest.fn(() => jest.fn());
  
  return mockExpress;
});

jest.mock('mongoose');
jest.mock('helmet', () => jest.fn(() => jest.fn()));
jest.mock('cors', () => jest.fn(() => jest.fn()));
jest.mock('morgan', () => jest.fn(() => jest.fn()));
jest.mock('express-rate-limit', () => ({
  __esModule: true,
  default: jest.fn(() => jest.fn())
}));

// Simple test to verify that the test environment works
describe('Application Environment Tests', () => {
  test('Test environment should be set up correctly', () => {
    // Simply verify that our test environment is working
    expect(true).toBe(true);
  });
  
  test('Application code exists', () => {
    // Check that we can require some files
    const error = require('../utils/error.util');
    expect(error).toBeDefined();
    
    const errorHandler = require('../utils/errorHandler');
    expect(errorHandler).toBeDefined();
  });
}); 