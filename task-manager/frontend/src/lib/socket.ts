// frontend/src/lib/socket.ts
import { io } from 'socket.io-client';

// Connect to the backend URL
export const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:4000', {
  transports: ['websocket'], // Force WebSocket for better performance
  autoConnect: true,
});