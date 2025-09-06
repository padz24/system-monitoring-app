/**
 * Real-time Monitoring Utilities
 * Handles WebSocket broadcasting of system metrics
 * Optimized for low resource usage
 */

import { getCPUUsage, getMemoryUsage } from './system.js';
import { getProcessList } from './processes.js';

let monitoringInterval = null;
let connectedClients = new Set();

/**
 * Start real-time system monitoring
 * @param {WebSocketServer} wss - WebSocket server instance
 */
export function startMonitoring(wss) {
  console.log('🔄 Starting system monitoring...');

  // Track connected clients
  wss.on('connection', (ws) => {
    connectedClients.add(ws);
    
    ws.on('close', () => {
      connectedClients.delete(ws);
    });
    
    ws.on('error', () => {
      connectedClients.delete(ws);
    });

    // Handle client messages
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        handleClientMessage(data, ws);
      } catch (e) {
        console.warn('Invalid WebSocket message:', e.message);
      }
    });
  });

  // Start monitoring interval
  startMonitoringLoop();
}

/**
 * Handle messages from WebSocket clients
 * @param {Object} data - Message data
 * @param {WebSocket} ws - Client WebSocket connection
 */
function handleClientMessage(data, ws) {
  switch (data.type) {
    case 'subscribe':
      ws.subscribed = true;
      console.log('Client subscribed to real-time updates');
      break;
    case 'unsubscribe':
      ws.subscribed = false;
      console.log('Client unsubscribed from real-time updates');
      break;
    case 'requestUpdate':
      // Send immediate update to this client
      sendSystemUpdate(ws);
      break;
    default:
      console.warn('Unknown message type:', data.type);
  }
}

/**
 * Start the monitoring loop
 */
function startMonitoringLoop() {
  // Clear existing interval
  if (monitoringInterval) {
    clearInterval(monitoringInterval);
  }

  // Start new monitoring interval (every 5 seconds to conserve resources)
  monitoringInterval = setInterval(async () => {
    if (connectedClients.size === 0) {
      return; // No clients, skip monitoring
    }

    try {
      await broadcastSystemUpdate();
    } catch (error) {
      console.error('Monitoring error:', error);
    }
  }, 5000);

  console.log('📊 Real-time monitoring started (5s intervals)');
}

/**
 * Broadcast system update to all subscribed clients
 */
async function broadcastSystemUpdate() {
  const subscribedClients = Array.from(connectedClients).filter(ws => ws.subscribed);
  
  if (subscribedClients.length === 0) {
    return;
  }

  try {
    // Gather system data efficiently
    const [cpuData, memoryData, topProcesses] = await Promise.allSettled([
      getCPUUsage(),
      getMemoryUsage(),
      getProcessList(10, 'cpu') // Top 10 processes by CPU
    ]);

    const updateData = {
      type: 'systemUpdate',
      timestamp: new Date().toISOString(),
      cpu: cpuData.status === 'fulfilled' ? cpuData.value : null,
      memory: memoryData.status === 'fulfilled' ? memoryData.value : null,
      processes: topProcesses.status === 'fulfilled' ? topProcesses.value : [],
      errors: [
        cpuData.status === 'rejected' ? cpuData.reason?.message : null,
        memoryData.status === 'rejected' ? memoryData.reason?.message : null,
        topProcesses.status === 'rejected' ? topProcesses.reason?.message : null
      ].filter(Boolean)
    };

    // Send to all subscribed clients
    subscribedClients.forEach(ws => {
      if (ws.readyState === 1) { // WebSocket.OPEN
        try {
          ws.send(JSON.stringify(updateData));
        } catch (e) {
          console.warn('Failed to send update to client:', e.message);
          connectedClients.delete(ws);
        }
      }
    });

  } catch (error) {
    console.error('Failed to broadcast system update:', error);
  }
}

/**
 * Send system update to specific client
 * @param {WebSocket} ws - Target WebSocket connection
 */
async function sendSystemUpdate(ws) {
  if (ws.readyState !== 1) return;

  try {
    const [cpuData, memoryData] = await Promise.allSettled([
      getCPUUsage(),
      getMemoryUsage()
    ]);

    const updateData = {
      type: 'systemUpdate',
      timestamp: new Date().toISOString(),
      cpu: cpuData.status === 'fulfilled' ? cpuData.value : null,
      memory: memoryData.status === 'fulfilled' ? memoryData.value : null
    };

    ws.send(JSON.stringify(updateData));
  } catch (error) {
    console.error('Failed to send system update:', error);
  }
}

/**
 * Stop monitoring
 */
export function stopMonitoring() {
  if (monitoringInterval) {
    clearInterval(monitoringInterval);
    monitoringInterval = null;
    console.log('🛑 System monitoring stopped');
  }
}