/**
 * System Information Routes
 * Provides CPU, memory, and general system information
 * Optimized for cross-platform compatibility
 */

import { Router } from 'express';
import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';
import { getSystemInfo, getCPUUsage, getMemoryUsage } from '../utils/system.js';

const router = Router();
const execAsync = promisify(exec);

/**
 * Get comprehensive system overview
 * Includes CPU, memory, OS info with error handling
 */
router.get('/overview', async (req, res) => {
  try {
    const [systemInfo, cpuUsage, memoryUsage] = await Promise.allSettled([
      getSystemInfo(),
      getCPUUsage(),
      getMemoryUsage()
    ]);

    res.json({
      timestamp: new Date().toISOString(),
      system: systemInfo.status === 'fulfilled' ? systemInfo.value : null,
      cpu: cpuUsage.status === 'fulfilled' ? cpuUsage.value : null,
      memory: memoryUsage.status === 'fulfilled' ? memoryUsage.value : null,
      errors: [
        systemInfo.status === 'rejected' ? systemInfo.reason?.message : null,
        cpuUsage.status === 'rejected' ? cpuUsage.reason?.message : null,
        memoryUsage.status === 'rejected' ? memoryUsage.reason?.message : null
      ].filter(Boolean)
    });
  } catch (error) {
    console.error('System overview error:', error);
    res.status(500).json({ 
      error: 'Failed to get system overview',
      message: error.message 
    });
  }
});

/**
 * Get detailed CPU information
 * Falls back to basic os module data if advanced commands fail
 */
router.get('/cpu', async (req, res) => {
  try {
    const cpuInfo = await getCPUUsage();
    res.json({
      timestamp: new Date().toISOString(),
      ...cpuInfo
    });
  } catch (error) {
    console.error('CPU info error:', error);
    
    // Fallback to basic CPU information
    const cpus = os.cpus();
    res.json({
      timestamp: new Date().toISOString(),
      model: cpus[0]?.model || 'Unknown',
      cores: cpus.length,
      speed: cpus[0]?.speed || 0,
      usage: 0, // Will be calculated by frontend polling
      architecture: process.arch,
      error: 'Limited CPU info available',
      fallback: true
    });
  }
});

/**
 * Get memory usage information
 * Includes total, free, and used memory with percentages
 */
router.get('/memory', async (req, res) => {
  try {
    const memoryInfo = await getMemoryUsage();
    res.json({
      timestamp: new Date().toISOString(),
      ...memoryInfo
    });
  } catch (error) {
    console.error('Memory info error:', error);
    
    // Fallback to basic memory information
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    
    res.json({
      timestamp: new Date().toISOString(),
      total: Math.round(totalMemory / 1024 / 1024),
      free: Math.round(freeMemory / 1024 / 1024),
      used: Math.round(usedMemory / 1024 / 1024),
      percentage: Math.round((usedMemory / totalMemory) * 100),
      error: 'Basic memory info only',
      fallback: true
    });
  }
});

/**
 * Get system uptime and load average
 */
router.get('/uptime', (req, res) => {
  try {
    const uptime = os.uptime();
    const loadavg = os.loadavg();
    
    res.json({
      timestamp: new Date().toISOString(),
      uptime: Math.floor(uptime),
      uptimeFormatted: formatUptime(uptime),
      loadAverage: {
        '1min': loadavg[0] || 0,
        '5min': loadavg[1] || 0,
        '15min': loadavg[2] || 0
      }
    });
  } catch (error) {
    console.error('Uptime error:', error);
    res.status(500).json({ 
      error: 'Failed to get uptime information',
      message: error.message 
    });
  }
});

/**
 * Format uptime seconds into human readable string
 * @param {number} seconds - Uptime in seconds
 * @returns {string} Formatted uptime string
 */
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

export default router;