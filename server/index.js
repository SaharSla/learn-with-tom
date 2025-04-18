// Import required modules
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const CodeBlock = require('./models/CodeBlocks');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
CLIENT_URL= 'https://learn-with-tom-client.onrender.com/'//learn-with-tom-client.onrender.com


const app = express();// Create the Express app instance
const rooms = {}; // Track rooms and their participants
const currentCodePerRoom = {}; // Stores latest code per room in RAM
const solutionPerRoom = {}; // Stores the correct solution per room

// Enable CORS so the frontend can communicate with this backend
app.use(cors());

// Enable JSON body parsing for incoming requests
app.use(express.json());

// Route: Get all code blocks from MongoDB
app.get('/api/codeblocks', async (req, res) => {
  console.log('Fetching code blocks...');
  try {
    const blocks = await CodeBlock.find();
    console.log('Blocks from DB:', blocks);
    res.json(blocks);
  } catch (err) {
    console.error('Error fetching code blocks:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Route: Get a single code block by its MongoDB ID
app.get('/api/codeblocks/:id', async (req, res) => {
  try {
    const block = await CodeBlock.findById(req.params.id);
    if (!block) return res.status(404).json({ error: 'Block not found' });
    res.json(block);
  } catch (err) {
    console.error('Error fetching block:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Root route: Simple health check
app.get('/', (req, res) => {
  res.send('Server is running!');
});

const server = http.createServer(app); // Create HTTP server from express app
const io = new Server(server, {
  cors: {
    origin: CLIENT_URL, // Allow client origin
    methods: ['GET', 'POST'],
  }
});



// Serve static files from the React app
app.use(express.static(path.join(__dirname, '..', 'client', 'build')));

// For any route not handled by the API, serve index.html from React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'build', 'index.html'));
});


server.listen(PORT, () => {
  console.log(`🚀 Server is live. Client is expected at: ${CLIENT_URL}`);
});


// Connect to MongoDB using Mongoose
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI is not defined in environment variables");
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);

  // When a client joins a room (block page)
  socket.on('joinRoom', (blockId) => {
    socket.join(blockId);

    // Load the solution from MongoDB and store in memory
    CodeBlock.findById(blockId).then(block => {
      if (block && block.solution) {
        solutionPerRoom[blockId] = block.solution;
      }
    });


    if (!rooms[blockId]) rooms[blockId] = [];
    rooms[blockId].push(socket.id);

    const role = rooms[blockId].length === 1 ? 'mentor' : 'student';
    socket.emit('roleAssigned', role);
    socket.emit('usersCount', rooms[blockId].length);
    console.log(`User ${socket.id} joined ${blockId} as ${role}`);

    // NEW: Send latest code in room if exists
    if (currentCodePerRoom[blockId]) {
      socket.emit('codeUpdated', currentCodePerRoom[blockId]);
    }



    // When student changes code
    // When student changes code
    socket.on('codeChanged', ({ blockId, code }) => {
      currentCodePerRoom[blockId] = code;
      socket.to(blockId).emit('codeUpdated', code); // send to others

      // Check if code matches the correct solution (from memory)
      const solution = solutionPerRoom[blockId];
      const isCorrect = code.trim() === solution?.trim();

      // If correct, broadcast to all users in room
      if (isCorrect) {
        io.to(blockId).emit('solutionCorrect'); // 🎉 show smiley to all
      }
    });

  });


  // When client disconnects
  socket.on('disconnecting', () => {
    for (const blockId of socket.rooms) {
      if (blockId === socket.id) continue; // skip default room
      if (!rooms[blockId]) continue;

      // Check if current socket is the mentor BEFORE removing
      const wasMentor = rooms[blockId][0] === socket.id;

      // Remove socket from room
      rooms[blockId] = rooms[blockId].filter(id => id !== socket.id);

      if (wasMentor) {
        io.to(blockId).emit('mentorLeft');
        delete rooms[blockId]; // clean up entire room
        console.log(`🚪 Mentor ${socket.id} left room ${blockId}`);
      } else {
        console.log(`👋 Student ${socket.id} left room ${blockId}`);
      }
    }
  });

});