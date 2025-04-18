const mongoose = require('mongoose');
const CodeBlock = require('./models/CodeBlocks');

// Replace with your real connection string:
const MONGO_URI = 'mongodb+srv://SaharSlavkin:alon!!!333@cluster0.hpgc4vd.mongodb.net/codeblocks-db?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');

    // Delete existing data to avoid duplicates
    await CodeBlock.deleteMany({});

    // Insert initial code blocks with description
    await CodeBlock.insertMany([
      {
        title: 'Async Case',
        code: `async function fetchData() {\n  // your code here\n}`,
        solution: `async function fetchData() {\n  return await fetch('/api/data');\n}`,
        description: 'Practice using async/await syntax in JavaScript.'
      },
      {
        title: 'Closure Practice',
        code: `function outer() {\n  // your code here\n}`,
        solution: `function outer() {\n  let count = 0;\n  return function inner() {\n    count++;\n    return count;\n  }\n}`,
        description: 'Understand how closures work and retain access to variables.'
      },
      {
        title: 'Recursion Game',
        code: `function factorial(n) {\n  // your code here\n}`,
        solution: `function factorial(n) {\n  if (n <= 1) return 1;\n  return n * factorial(n - 1);\n}`,
        description: 'Get familiar with writing recursive functions.'
      },
      {
        title: 'DOM Quiz',
        code: `document.getElementById("myBtn").addEventListener("click", function() {\n  // your code here\n});`,
        solution: `document.getElementById("myBtn").addEventListener("click", function() {\n  alert("Button clicked!");\n});`,
        description: 'Learn how to attach event listeners to DOM elements.'
      }
    ]);

    console.log('✅ Code blocks seeded successfully!');
    process.exit();
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });
