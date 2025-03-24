const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const rateLimit = require('express-rate-limit');

// Import routes
const authRoutes = require('./routes/auth.routes');
const contactRoutes = require('./routes/contact.routes');
const projectRoutes = require('./routes/project.routes');
const terminalRoutes = require('./routes/terminal.routes');
const adminRoutes = require('./routes/admin.routes');

// Import middleware
const { errorHandler } = require('./utils/errorHandler');

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Rey\'s Portfolio API',
      version: '1.0.0',
      description: 'API for Rey\'s AI Engineer Portfolio Website',
      contact: {
        name: 'API Support',
        email: 'rey@example.com',
      },
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://api.portfolio.example.com' 
          : `http://localhost:${process.env.PORT || 5000}`,
        description: process.env.NODE_ENV === 'production' ? 'Production Server' : 'Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

// Create Express app
const app = express();

// Basic security
app.use(helmet());

// CORS setup
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://rey-project-front.vercel.app',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request logging
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);

// Set static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/terminal', terminalRoutes);
app.use('/api/admin', adminRoutes);

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Home route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to Rey\'s Portfolio API',
    version: '1.0.0',
    documentation: '/api-docs',
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `The requested resource '${req.originalUrl}' does not exist`,
  });
});

// Global error handler
app.use(errorHandler);

module.exports = app; 