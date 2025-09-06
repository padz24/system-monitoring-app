/**
 * Process Management Routes
 * Handles process listing and management
 * Optimized for Termux/Android limitations
 */

import { Router } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import { getProcessList } from '../utils/processes.js';

const router = Router();
const execAsync = promisify(exec);

/**
 * Get list of running processes
 * Falls back to Node.js process info if system commands fail
 */
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const sortBy = req.query.sort || 'cpu'; // cpu, memory, name
    
    const processes = await getProcessList(limit, sortBy);
    
    res.json({
      timestamp: new Date().toISOString(),
      count: processes.length,
      processes
    });
  } catch (error) {
    console.error('Process list error:', error);
    
    // Fallback to basic Node.js process information
    res.json({
      timestamp: new Date().toISOString(),
      count: 1,
      processes: [{
        pid: process.pid,
        name: 'node',
        cpu: 0,
        memory: Math.round(process.memoryUsage().rss / 1024 / 1024),
        user: process.env.USER || 'unknown',
        command: process.argv.join(' ')
      }],
      error: 'Limited process info available',
      fallback: true
    });
  }
});

/**
 * Get detailed information about a specific process
 * @param {number} pid - Process ID
 */
router.get('/:pid', async (req, res) => {
  try {
    const pid = parseInt(req.params.pid);
    
    if (isNaN(pid)) {
      return res.status(400).json({ error: 'Invalid PID' });
    }
    
    // Try to get detailed process information
    if (process.platform !== 'win32') {
      try {
        const { stdout } = await execAsync(`ps -p ${pid} -o pid,ppid,user,cpu,pmem,etime,comm,args --no-headers`);
        
        if (stdout.trim()) {
          const parts = stdout.trim().split(/\s+/);
          res.json({
            pid: parseInt(parts[0]),
            ppid: parseInt(parts[1]),
            user: parts[2],
            cpu: parseFloat(parts[3]),
            memory: parseFloat(parts[4]),
            runtime: parts[5],
            command: parts.slice(6).join(' ')
          });
        } else {
          res.status(404).json({ error: 'Process not found' });
        }
      } catch (cmdError) {
        throw cmdError;
      }
    } else {
      // Windows fallback
      const { stdout } = await execAsync(`tasklist /FI "PID eq ${pid}" /FO CSV`);
      // Parse Windows tasklist output
      res.json({ error: 'Windows process details not fully implemented' });
    }
  } catch (error) {
    console.error('Process detail error:', error);
    
    // Check if it's the current Node.js process
    if (parseInt(req.params.pid) === process.pid) {
      const memUsage = process.memoryUsage();
      res.json({
        pid: process.pid,
        ppid: process.ppid,
        user: process.env.USER || 'unknown',
        memory: {
          rss: Math.round(memUsage.rss / 1024 / 1024),
          heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
          heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
          external: Math.round(memUsage.external / 1024 / 1024)
        },
        uptime: Math.floor(process.uptime()),
        command: process.argv.join(' '),
        fallback: true
      });
    } else {
      res.status(404).json({ 
        error: 'Process not found or insufficient permissions',
        message: error.message 
      });
    }
  }
});

/**
 * Get process tree (parent-child relationships)
 * Limited functionality on restricted environments
 */
router.get('/tree/view', async (req, res) => {
  try {
    // This is a simplified implementation
    // Full process tree requires more system access
    const processes = await getProcessList(50);
    
    // Group processes by parent PID (simplified)
    const processTree = processes.reduce((tree, proc) => {
      const ppid = proc.ppid || 0;
      if (!tree[ppid]) tree[ppid] = [];
      tree[ppid].push(proc);
      return tree;
    }, {});
    
    res.json({
      timestamp: new Date().toISOString(),
      tree: processTree,
      note: 'Simplified process tree - full tree requires elevated permissions'
    });
  } catch (error) {
    console.error('Process tree error:', error);
    res.status(500).json({ 
      error: 'Failed to get process tree',
      message: error.message 
    });
  }
});

export default router;