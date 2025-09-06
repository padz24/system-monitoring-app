/**
 * System Information Utilities
 * Cross-platform system information gathering
 * Optimized for Termux/Android with fallbacks
 */

import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';
import { readFile } from 'fs/promises';

const execAsync = promisify(exec);

/**
 * Get comprehensive system information
 * @returns {Promise<Object>} System information object
 */
export async function getSystemInfo() {
  const info = {
    hostname: os.hostname(),
    platform: os.platform(),
    architecture: os.arch(),
    nodeVersion: process.version,
    totalMemory: Math.round(os.totalmem() / 1024 / 1024 / 1024 * 100) / 100, // GB
    cpuCount: os.cpus().length,
    networkInterfaces: Object.keys(os.networkInterfaces()).length
  };

  // Try to get additional system information
  try {
    if (process.platform === 'linux') {
      // Try to read OS release information
      try {
        const osRelease = await readFile('/etc/os-release', 'utf8');
        const nameMatch = osRelease.match(/PRETTY_NAME="([^"]+)"/);
        if (nameMatch) {
          info.osName = nameMatch[1];
        }
      } catch (e) {
        // Fallback for Android/Termux
        info.osName = 'Linux';
      }

      // Try to get kernel version
      try {
        const { stdout } = await execAsync('uname -r', { timeout: 5000 });
        info.kernelVersion = stdout.trim();
      } catch (e) {
        info.kernelVersion = 'Unknown';
      }
    } else if (process.platform === 'win32') {
      info.osName = 'Windows';
      try {
        const { stdout } = await execAsync('ver', { timeout: 5000 });
        info.windowsVersion = stdout.trim();
      } catch (e) {
        // Ignore version detection failure
      }
    } else if (process.platform === 'darwin') {
      info.osName = 'macOS';
      try {
        const { stdout } = await execAsync('sw_vers -productVersion', { timeout: 5000 });
        info.macVersion = stdout.trim();
      } catch (e) {
        // Ignore version detection failure
      }
    }
  } catch (error) {
    console.warn('Could not get extended system info:', error.message);
  }

  return info;
}

/**
 * Get current CPU usage information
 * @returns {Promise<Object>} CPU usage data
 */
export async function getCPUUsage() {
  const cpus = os.cpus();
  const cpuInfo = {
    model: cpus[0]?.model || 'Unknown',
    cores: cpus.length,
    speed: cpus[0]?.speed || 0,
    architecture: process.arch
  };

  // Calculate CPU usage (requires two measurements)
  const usage = await getCPUPercent();
  cpuInfo.usage = usage;

  // Try to get additional CPU information on Linux
  if (process.platform === 'linux') {
    try {
      const cpuTemp = await getCPUTemperature();
      if (cpuTemp !== null) {
        cpuInfo.temperature = cpuTemp;
      }
    } catch (error) {
      // Temperature monitoring not available
      console.warn('CPU temperature not available:', error.message);
    }
  }

  return cpuInfo;
}

/**
 * Calculate CPU usage percentage
 * @returns {Promise<number>} CPU usage percentage
 */
async function getCPUPercent() {
  return new Promise((resolve) => {
    const cpus1 = os.cpus();
    
    setTimeout(() => {
      const cpus2 = os.cpus();
      
      let totalIdle = 0;
      let totalTick = 0;
      
      for (let i = 0; i < cpus1.length; i++) {
        const cpu1 = cpus1[i];
        const cpu2 = cpus2[i];
        
        const idle1 = cpu1.times.idle;
        const idle2 = cpu2.times.idle;
        
        const total1 = Object.values(cpu1.times).reduce((a, b) => a + b, 0);
        const total2 = Object.values(cpu2.times).reduce((a, b) => a + b, 0);
        
        totalIdle += idle2 - idle1;
        totalTick += total2 - total1;
      }
      
      const usage = 100 - Math.round((totalIdle / totalTick) * 100);
      resolve(Math.max(0, Math.min(100, usage)));
    }, 100);
  });
}

/**
 * Get CPU temperature (Linux only)
 * @returns {Promise<number|null>} Temperature in Celsius or null if not available
 */
async function getCPUTemperature() {
  try {
    // Try common thermal zones
    const thermalPaths = [
      '/sys/class/thermal/thermal_zone0/temp',
      '/sys/class/thermal/thermal_zone1/temp'
    ];
    
    for (const path of thermalPaths) {
      try {
        const temp = await readFile(path, 'utf8');
        const tempValue = parseInt(temp.trim());
        if (!isNaN(tempValue)) {
          return Math.round(tempValue / 1000); // Convert from millidegree to degree
        }
      } catch (e) {
        // Try next path
        continue;
      }
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Get memory usage information
 * @returns {Promise<Object>} Memory usage data
 */
export async function getMemoryUsage() {
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;

  const memInfo = {
    total: Math.round(totalMemory / 1024 / 1024), // MB
    free: Math.round(freeMemory / 1024 / 1024),   // MB
    used: Math.round(usedMemory / 1024 / 1024),   // MB
    percentage: Math.round((usedMemory / totalMemory) * 100)
  };

  // Try to get more detailed memory information on Linux
  if (process.platform === 'linux') {
    try {
      const meminfo = await readFile('/proc/meminfo', 'utf8');
      const lines = meminfo.split('\n');
      
      const getMemValue = (name) => {
        const line = lines.find(l => l.startsWith(name));
        if (line) {
          const match = line.match(/(\d+)/);
          return match ? Math.round(parseInt(match[1]) / 1024) : 0; // Convert kB to MB
        }
        return 0;
      };

      memInfo.available = getMemValue('MemAvailable:');
      memInfo.buffers = getMemValue('Buffers:');
      memInfo.cached = getMemValue('Cached:');
      memInfo.swapTotal = getMemValue('SwapTotal:');
      memInfo.swapFree = getMemValue('SwapFree:');
      memInfo.swapUsed = memInfo.swapTotal - memInfo.swapFree;
      
    } catch (error) {
      console.warn('Could not read /proc/meminfo:', error.message);
    }
  }

  return memInfo;
}