#!/bin/bash
# Development environment setup script for Rey's Portfolio Backend

echo "Setting up development environment for Rey's Portfolio Backend..."

# Create necessary directories
mkdir -p uploads
echo "Created uploads directory"

# Copy environment variables if not exist
if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env file from .env.example"
  echo "Please update the .env file with your actual credentials"
else
  echo ".env file already exists"
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Setup complete
echo "Setup complete! You can now start the development server with:"
echo "npm run dev"
echo ""
echo "To use Docker instead, run:"
echo "docker-compose up -d" 