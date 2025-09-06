/**
 * System Monitoring Server
 * Optimized for Android/Termux environments with limited resources
 * 
 * Features:
 * - RESTful API for system information
 * - WebSocket for real-time updates
 * - Cross-platform compatibility
 * - Fallback mechanisms for restricted environments
 */

import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import systemRoutes from './routes/system.js';
import processRoutes from './routes/processes.js';
import { startMonitoring } from './utils/monitor.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all origins (adjust for production)
app.use(cors({
  origin: "http://localhost:5173", // ganti sesuai alamat frontend lo
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    platform: process.platform,
    nodeVersion: process.version
  });
});

// API Routes
app.use('/api/system', systemRoutes);
app.use('/api/processes', processRoutes);

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Create HTTP server
const server = createServer(app);

// WebSocket server for real-time updates
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('Client connected to WebSocket');
  
  // Send initial system data
  ws.send(JSON.stringify({ type: 'connected', timestamp: Date.now() }));
  
  ws.on('close', () => {
    console.log('Client disconnected from WebSocket');
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Start real-time monitoring
startMonitoring(wss);

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api`);
  console.log(`🔌 WebSocket available at ws://localhost:${PORT}`);
  console.log(`💻 Platform: ${process.platform}`);
  console.log(`🏗️  Architecture: ${process.arch}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    process.exit(0);
  });
});