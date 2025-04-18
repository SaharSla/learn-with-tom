// models/CodeBlock.js

const mongoose = require('mongoose');

// Define the schema for a code block
const codeBlockSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true // Title of the code block (e.g., "Async Case")
  },
  code: {
    type: String,
    required: true // Initial code template shown to students
  },
  solution: {
    type: String,
    required: true // The correct solution to compare against
  },
  description: {
    type: String,
    default: '', // Optional description for the code block
  }
});

// Create a model from the schema
const CodeBlock = mongoose.model('CodeBlock', codeBlockSchema);

module.exports = CodeBlock;