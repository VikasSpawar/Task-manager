// backend/src/index.ts
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

// Import Routes
import authRoutes from './routes/auth.routes';
import taskRoutes from './routes/task.routes';

// Load env vars
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// 1. Middlewares
// Passing no arguments to cors() allows ALL origins by default
app.use(cors()); 
app.use(express.json());

// 2. Create HTTP Server & Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // 🌍 Allow connections from ANYWHERE
    methods: ["GET", "POST", "PATCH", "DELETE"]
  }
});

// 3. Make Socket.io accessible globally
app.set('io', io); 

// Global Socket Connection Log
io.on('connection', (socket) => {
  console.log('⚡ Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// 4. Routes
app.use('/auth', authRoutes);
app.use('/tasks', taskRoutes);

// 5. Health Check
app.get('/', (req, res) => {
  res.send('Task Manager API is running 🚀');
});

// 6. Start Server
server.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

export { io };