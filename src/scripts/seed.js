/**
 * Seed script to populate the database with initial data
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const User = require('../models/user.model');
const Project = require('../models/project.model');
const TerminalCommand = require('../models/terminalCommand.model');

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected for seeding'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Sample data
const userData = {
  name: 'Admin User',
  email: process.env.ADMIN_EMAIL || 'admin@example.com',
  password: process.env.ADMIN_PASSWORD || 'AdminPassword123!',
  role: 'admin',
};

const projectsData = [
  {
    title: 'AI-Powered Chatbot',
    slug: 'ai-powered-chatbot',
    summary: 'A natural language chatbot using the latest AI models',
    description: 'This project demonstrates my ability to integrate large language models into practical applications. The chatbot can answer questions, provide recommendations, and engage in natural conversation.',
    technologies: ['Python', 'TensorFlow', 'NLP', 'FastAPI'],
    category: 'AI/ML',
    githubUrl: 'https://github.com/example/ai-chatbot',
    liveUrl: 'https://ai-chatbot-demo.vercel.app',
    featured: true,
    year: 2023,
  },
  {
    title: 'Computer Vision Object Detection',
    slug: 'computer-vision-object-detection',
    summary: 'Real-time object detection system using computer vision',
    description: 'This computer vision system can detect and classify objects in real-time video feeds. It uses a combination of traditional CV techniques and modern deep learning approaches for optimal performance.',
    technologies: ['Python', 'OpenCV', 'YOLO', 'PyTorch'],
    category: 'Computer Vision',
    githubUrl: 'https://github.com/example/cv-object-detection',
    featured: true,
    year: 2022,
  },
  {
    title: 'Portfolio Website',
    slug: 'portfolio-website',
    summary: 'Personal portfolio website with advanced features',
    description: 'This is the website you are currently viewing! Built with modern web technologies and featuring a custom terminal interface, project showcase, and contact system.',
    technologies: ['Next.js', 'React', 'Node.js', 'MongoDB', 'Express'],
    category: 'Web Development',
    githubUrl: 'https://github.com/example/portfolio-website',
    liveUrl: 'https://portfolio.example.com',
    featured: true,
    year: 2023,
  }
];

const terminalCommandsData = [
  {
    command: 'help',
    type: 'system',
    description: 'Displays available commands',
    isActive: true,
    response: 'Available commands: help, about, skills, projects, contact, clear, ls, pwd'
  },
  {
    command: 'about',
    type: 'system',
    description: 'Displays information about Rey',
    isActive: true,
    response: "Hi, I'm Rey! An AI Engineer with expertise in machine learning, deep learning, and computer vision. I build intelligent systems that solve real-world problems."
  },
  {
    command: 'skills',
    type: 'system',
    description: 'Lists Rey\'s technical skills',
    isActive: true,
    response: "- Programming: Python, JavaScript, TypeScript\n- ML/AI: TensorFlow, PyTorch, Scikit-learn, Hugging Face\n- Computer Vision: OpenCV, YOLO, MediaPipe\n- Web: React, Next.js, Node.js\n- DevOps: Docker, Kubernetes, AWS"
  },
  {
    command: 'projects',
    type: 'system',
    description: 'Shows Rey\'s featured projects',
    isActive: true,
    response: "Use the 'projects' command to view my featured projects. You can also visit the Projects page for more details."
  },
  {
    command: 'contact',
    type: 'system',
    description: 'Shows contact information',
    isActive: true,
    response: "You can reach me through the contact form on this website or via email at rey@example.com."
  },
  {
    command: 'clear',
    type: 'system',
    description: 'Clears the terminal screen',
    isActive: true,
    response: 'Terminal cleared'
  },
  {
    command: 'ls',
    type: 'system',
    description: 'Lists items in the current directory',
    isActive: true,
    response: 'about.txt projects.txt skills.txt contact.txt'
  },
  {
    command: 'pwd',
    type: 'system',
    description: 'Prints working directory',
    isActive: true,
    response: '/home/rey'
  }
];

// Seed function
async function seedDatabase() {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Project.deleteMany({});
    await TerminalCommand.deleteMany({});
    
    console.log('Existing data cleared');

    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    
    const adminUser = new User({
      ...userData,
      password: hashedPassword,
    });
    
    await adminUser.save();
    console.log('Admin user created');
    
    // Create projects
    const projects = await Project.insertMany(projectsData);
    console.log(`${projects.length} projects created`);
    
    // Create terminal commands
    const commands = await TerminalCommand.insertMany(terminalCommandsData);
    console.log(`${commands.length} terminal commands created`);
    
    console.log('Database seeded successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase(); 