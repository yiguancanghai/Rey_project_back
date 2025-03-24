const TerminalCommand = require('../models/terminal-command.model');
const Project = require('../models/project.model');
const { AppError } = require('../utils/error.util');

/**
 * Process terminal command
 * @route POST /api/terminal
 */
exports.processCommand = async (req, res, next) => {
  try {
    const { command } = req.body;
    
    if (!command) {
      return next(new AppError('Command is required', 400));
    }

    // Parse the command (first word is the command, rest are arguments)
    const parts = command.trim().split(' ');
    const cmdName = parts[0].toLowerCase();
    const args = parts.slice(1);

    // Look for the command in the database
    const terminalCommand = await TerminalCommand.findOne({ 
      command: cmdName,
      isActive: true
    });

    // If command not found, return help
    if (!terminalCommand) {
      return res.status(200).json({
        status: 'success',
        data: {
          output: `Command not found: ${cmdName}. Type 'help' to see available commands.`
        }
      });
    }

    // Process different command types
    let output = '';
    
    switch (terminalCommand.type) {
      case 'static':
        // Static response, just return it
        output = terminalCommand.response || 'No output';
        break;
        
      case 'alias':
        // Process alias command
        if (terminalCommand.aliasFor) {
          const aliasCommand = await TerminalCommand.findOne({ 
            command: terminalCommand.aliasFor,
            isActive: true
          });
          
          if (aliasCommand) {
            output = aliasCommand.response || 'No output';
          } else {
            output = `Alias target not found: ${terminalCommand.aliasFor}`;
          }
        } else {
          output = 'Invalid alias configuration';
        }
        break;
        
      case 'dynamic':
        // Execute dynamic commands
        output = await processDynamicCommand(terminalCommand, args);
        break;
        
      case 'ai':
        // TODO: Implement AI-based response processing
        output = 'AI command processing not yet implemented';
        break;
        
      default:
        output = 'Unknown command type';
    }

    // Log command usage here if needed

    res.status(200).json({
      status: 'success',
      data: {
        output
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Process dynamic commands
 * @param {Object} command - Terminal command object
 * @param {Array} args - Command arguments
 * @returns {Promise<string>} Command output
 */
const processDynamicCommand = async (command, args) => {
  switch (command.command) {
    case 'help':
      return await generateHelpOutput(args[0]);
      
    case 'projects':
      return await generateProjectsOutput(args);
      
    case 'clear':
      return 'CLEAR_TERMINAL';
      
    case 'skills':
      return generateSkillsOutput();
      
    default:
      if (command.script) {
        try {
          // Be careful with eval - it's used here just as an example
          // In a real app, you'd want a more secure way to execute dynamic code
          // eslint-disable-next-line no-eval
          return eval(command.script)(args);
        } catch (error) {
          console.error('Error executing dynamic script:', error);
          return `Error: ${error.message}`;
        }
      }
      return 'Command processing not implemented';
  }
};

/**
 * Generate help output
 * @param {string} category - Optional category filter
 * @returns {Promise<string>} Help output
 */
const generateHelpOutput = async (category) => {
  let query = { isActive: true };
  
  if (category) {
    query.category = category;
  }
  
  const commands = await TerminalCommand.find(query).sort({ category: 1, order: 1 });
  
  if (commands.length === 0) {
    return 'No commands available';
  }
  
  let output = 'Available commands:\n\n';
  let currentCategory = '';
  
  for (const cmd of commands) {
    if (currentCategory !== cmd.category) {
      currentCategory = cmd.category;
      output += `\n== ${currentCategory.toUpperCase()} ==\n`;
    }
    
    output += `${cmd.command.padEnd(15)} - ${cmd.description || 'No description'}\n`;
  }
  
  return output;
};

/**
 * Generate projects output
 * @param {Array} args - Command arguments
 * @returns {Promise<string>} Projects output
 */
const generateProjectsOutput = async (args) => {
  try {
    let query = {};
    
    // Process arguments to filter projects
    if (args.length > 0) {
      if (args[0] === 'ai') {
        query.projectType = 'AI';
      } else if (args[0] === 'web') {
        query.projectType = 'Web';
      } else if (args[0] === 'mobile') {
        query.projectType = 'Mobile';
      } else if (args[0] === 'featured') {
        query.featured = true;
      }
    }
    
    const projects = await Project.find(query).sort({ order: 1 });
    
    if (projects.length === 0) {
      return 'No projects found';
    }
    
    let output = 'Projects:\n\n';
    
    for (const project of projects) {
      output += `${project.title} [${project.projectType}]\n`;
      output += `${'-'.repeat(project.title.length + project.projectType.length + 3)}\n`;
      output += `${project.shortDescription}\n`;
      output += `Technologies: ${project.technologies.join(', ')}\n`;
      
      if (project.githubUrl) {
        output += `GitHub: ${project.githubUrl}\n`;
      }
      
      if (project.demoUrl) {
        output += `Demo: ${project.demoUrl}\n`;
      }
      
      output += '\n';
    }
    
    return output;
  } catch (error) {
    console.error('Error generating projects output:', error);
    return 'Error fetching projects';
  }
};

/**
 * Generate skills output
 * @returns {string} Skills output
 */
const generateSkillsOutput = () => {
  // This could be dynamic from database in the future
  return `
= Technical Skills =

== Programming Languages ==
• JavaScript / TypeScript
• Python
• Go
• Java

== AI / Machine Learning ==
• TensorFlow / PyTorch
• Natural Language Processing
• Computer Vision
• Reinforcement Learning
• LLM Prompt Engineering

== Web Development ==
• React / Next.js
• Node.js / Express
• REST API Design
• GraphQL
• MongoDB / PostgreSQL

== DevOps ==
• Docker / Kubernetes
• CI/CD Pipelines
• AWS / GCP / Azure
• Linux System Administration
`;
};

/**
 * Get all terminal commands (admin only)
 * @route GET /api/terminal/commands
 */
exports.getAllCommands = async (req, res, next) => {
  try {
    const commands = await TerminalCommand.find().sort({ category: 1, order: 1 });
    
    res.status(200).json({
      status: 'success',
      results: commands.length,
      data: {
        commands
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a specific command
 * @route GET /api/terminal/commands/:id
 */
exports.getCommand = async (req, res, next) => {
  try {
    const command = await TerminalCommand.findById(req.params.id);
    
    if (!command) {
      return next(new AppError('Command not found', 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        command
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new command
 * @route POST /api/terminal/commands
 */
exports.createCommand = async (req, res, next) => {
  try {
    // Check if command already exists
    const existingCommand = await TerminalCommand.findOne({ 
      command: req.body.command.toLowerCase() 
    });
    
    if (existingCommand) {
      return next(new AppError('Command already exists', 400));
    }
    
    // Create new command
    const command = await TerminalCommand.create({
      ...req.body,
      command: req.body.command.toLowerCase(),
      createdBy: req.user ? req.user._id : null
    });
    
    res.status(201).json({
      status: 'success',
      data: {
        command
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a command
 * @route PATCH /api/terminal/commands/:id
 */
exports.updateCommand = async (req, res, next) => {
  try {
    // If command name is being updated, check for duplicates
    if (req.body.command) {
      req.body.command = req.body.command.toLowerCase();
      
      const existingCommand = await TerminalCommand.findOne({ 
        command: req.body.command,
        _id: { $ne: req.params.id }
      });
      
      if (existingCommand) {
        return next(new AppError('Command name already exists', 400));
      }
    }
    
    const command = await TerminalCommand.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!command) {
      return next(new AppError('Command not found', 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        command
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a command
 * @route DELETE /api/terminal/commands/:id
 */
exports.deleteCommand = async (req, res, next) => {
  try {
    const command = await TerminalCommand.findByIdAndDelete(req.params.id);
    
    if (!command) {
      return next(new AppError('Command not found', 404));
    }
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
}; 