# Rey AI Engineer Portfolio Backend

This is the Express.js backend API for Rey's AI Engineer Portfolio website.

## Features

- RESTful API for portfolio projects
- Contact form submission handler
- Terminal command simulation
- Authentication system
- Data storage with MongoDB

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env` file with the following variables:
```
NODE_ENV=development
PORT=5002
MONGODB_URI=mongodb://localhost:27017/rey-portfolio
JWT_SECRET=your-secret-key
JWT_EXPIRE=30d
EMAIL_SERVICE=smtp.example.com
EMAIL_USERNAME=your-email
EMAIL_PASSWORD=your-password
EMAIL_FROM=noreply@example.com
```

3. Run the development server:
```bash
npm run dev
```

4. The API will be available at [http://localhost:5002/api](http://localhost:5002/api)

## API Documentation

- Projects: `/api/projects`
- Contact Form: `/api/contacts`
- Terminal Commands: `/api/terminal`
- Authentication: `/api/auth`

## Deployment to Vercel

1. Push your code to a GitHub repository.

2. Connect the repository to Vercel:
   - Create a Vercel account if you don't have one
   - Import your GitHub repository
   - Configure environment variables in the Vercel dashboard

3. For databases:
   - Setup MongoDB Atlas for production database
   - Add the connection string to Vercel environment variables

4. Deploy:
   - Vercel will automatically build and deploy your API
   - Each push to the main branch will trigger a new deployment

## Important Notes

- Make sure to use proper environment variables for production
- Set up proper authentication and authorization mechanisms
- Handle CORS settings appropriately for your frontend domain
- Never commit sensitive information like API keys or passwords 