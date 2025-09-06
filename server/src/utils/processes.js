/**
 * Process Management Utilities
 * Cross-platform process information gathering
 * Handles Termux/Android limitations gracefully
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Get list of running processes
 * @param {number} limit - Maximum number of processes to return
 * @param {string} sortBy - Sort criteria (cpu, memory, name)
 * @returns {Promise<Array>} Array of process objects
 */
export async function getProcessList(limit = 20, sortBy = 'cpu') {
  try {
    if (process.platform === 'win32') {
      return await getWindowsProcesses(limit, sortBy);
    } else {
      return await getUnixProcesses(limit, sortBy);
    }
  } catch (error) {
    console.warn('Failed to get process list:', error.message);
    
    // Fallback: return current Node.js process only
    return [{
      pid: process.pid,
      ppid: process.ppid || 0,
      name: 'node',
      cpu: 0,
      memory: Math.round(process.memoryUsage().rss / 1024 / 1024),
      user: process.env.USER || process.env.USERNAME || 'unknown',
      command: process.argv.join(' '),
      status: 'running'
    }];
  }
}

/**
 * Get processes on Unix-like systems (Linux, macOS)
 * @param {number} limit - Maximum number of processes
 * @param {string} sortBy - Sort criteria
 * @returns {Promise<Array>} Process list
 */
async function getUnixProcesses(limit, sortBy) {
  try {
    // Try different ps commands based on system capabilities
    const commands = [
      'ps aux --sort=-%cpu',  // GNU ps with sorting
      'ps aux',               // Standard ps
      'ps -eo pid,ppid,user,cpu,pmem,comm,args', // Alternative format
      'ps -A'                 // Minimal fallback
    ];

    let stdout = '';
    let commandUsed = '';

    for (const cmd of commands) {
      try {
        const result = await execAsync(cmd, { timeout: 10000 });
        stdout = result.stdout;
        commandUsed = cmd;
        break;
      } catch (e) {
        continue;
      }
    }

    if (!stdout) {
      throw new Error('No ps command succeeded');
    }

    return parseUnixProcesses(stdout, limit, sortBy, commandUsed);
    
  } catch (error) {
    console.warn('Unix process command failed:', error.message);
    throw error;
  }
}

/**
 * Parse Unix ps command output
 * @param {string} stdout - Command output
 * @param {number} limit - Process limit
 * @param {string} sortBy - Sort criteria
 * @param {string} commandUsed - Which command was used
 * @returns {Array} Parsed process list
 */
function parseUnixProcesses(stdout, limit, sortBy, commandUsed) {
  const lines = stdout.trim().split('\n');
  const processes = [];

  // Skip header line
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    try {
      let process;
      
      if (commandUsed.includes('aux')) {
        // Parse 'ps aux' format
        const parts = line.split(/\s+/);
        if (parts.length >= 11) {
          process = {
            pid: parseInt(parts[1]),
            ppid: 0, // Not available in aux format
            user: parts[0],
            cpu: parseFloat(parts[2]) || 0,
            memory: parseFloat(parts[3]) || 0,
            memoryMB: calculateMemoryMB(parts[4], parts[5]),
            vsz: parseInt(parts[4]) || 0,
            rss: parseInt(parts[5]) || 0,
            status: parts[7] || 'unknown',
            start: parts[8] || '',
            time: parts[9] || '',
            name: parts[10] || 'unknown',
            command: parts.slice(10).join(' ')
          };
        }
      } else {
        // Parse other formats
        const parts = line.split(/\s+/);
        if (parts.length >= 6) {
          process = {
            pid: parseInt(parts[0]),
            ppid: parseInt(parts[1]) || 0,
            user: parts[2] || 'unknown',
            cpu: parseFloat(parts[3]) || 0,
            memory: parseFloat(parts[4]) || 0,
            name: parts[5] || 'unknown',
            command: parts.slice(6).join(' ') || parts[5]
          };
        }
      }

      if (process && process.pid) {
        processes.push(process);
      }
    } catch (e) {
      // Skip malformed lines
      continue;
    }
  }

  // Sort processes
  processes.sort((a, b) => {
    switch (sortBy) {
      case 'memory':
        return (b.memory || 0) - (a.memory || 0);
      case 'name':
        return (a.name || '').localeCompare(b.name || '');
      case 'pid':
        return a.pid - b.pid;
      default: // cpu
        return (b.cpu || 0) - (a.cpu || 0);
    }
  });

  return processes.slice(0, limit);
}

/**
 * Calculate memory in MB from VSZ and RSS values
 * @param {string} vsz - Virtual memory size
 * @param {string} rss - Resident set size
 * @returns {number} Memory in MB
 */
function calculateMemoryMB(vsz, rss) {
  const rssKB = parseInt(rss) || 0;
  return Math.round(rssKB / 1024); // Convert KB to MB
}

/**
 * Get processes on Windows systems
 * @param {number} limit - Maximum number of processes
 * @param {string} sortBy - Sort criteria
 * @returns {Promise<Array>} Process list
 */
async function getWindowsProcesses(limit, sortBy) {
  try {
    const { stdout } = await execAsync('tasklist /FO CSV', { timeout: 10000 });
    const lines = stdout.trim().split('\n');
    const processes = [];

    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      try {
        // Parse CSV format from tasklist
        const parts = line.split('","').map(part => part.replace(/"/g, ''));
        
        if (parts.length >= 5) {
          const memoryStr = parts[4].replace(/[,\s]/g, '');
          const memoryKB = parseInt(memoryStr) || 0;
          
          processes.push({
            pid: parseInt(parts[1]),
            name: parts[0],
            sessionName: parts[2],
            sessionId: parseInt(parts[3]) || 0,
            memory: memoryKB,
            memoryMB: Math.round(memoryKB / 1024),
            cpu: 0, // CPU usage not available in tasklist
            user: 'unknown',
            command: parts[0]
          });
        }
      } catch (e) {
        // Skip malformed lines
        continue;
      }
    }

    // Sort processes
    processes.sort((a, b) => {
      switch (sortBy) {
        case 'memory':
          return b.memory - a.memory;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'pid':
          return a.pid - b.pid;
        default:
          return b.memory - a.memory; // Fallback to memory since CPU not available
      }
    });

    return processes.slice(0, limit);
    
  } catch (error) {
    console.warn('Windows process command failed:', error.message);
    throw error;
  }
}