/**
 * Process List Component
 * Displays running processes with filtering and sorting
 * Optimized for mobile viewing and Termux limitations
 */

import React, { useState, useEffect } from 'react';
import {
  Activity,
  Search,
  Filter,
  ArrowUpDown,
  User,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import { formatBytes } from '../utils/formatters';
import axios from 'axios';

interface Process {
  pid: number;
  ppid?: number;
  name: string;
  cpu: number;
  memory: number;
  memoryMB?: number;
  user: string;
  command: string;
  status?: string;
}

interface ProcessListProps {
  data: any;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

const ProcessList: React.FC<ProcessListProps> = ({
  loading,
  error,
  onRefresh
}) => {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [filteredProcesses, setFilteredProcesses] = useState<Process[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'cpu' | 'memory' | 'name' | 'pid'>('cpu');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showUserFilter, setShowUserFilter] = useState(false);
  const [selectedUser, setSelectedUser] = useState('all');

  /**
   * axios.get process data
   */
  const fetchProcesses = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/processes?limit=50&sort=${sortBy}`
      );
      const processData = response.data; // axios auto-parse JSON

      if (processData.processes) {
        setProcesses(processData.processes);
      }
    } catch (error) {
      console.error("Failed to fetch processes:", error);
    }
  };

  /**
   * Initialize process data
   */
  useEffect(() => {
    fetchProcesses();

    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchProcesses, 10000);
    return () => clearInterval(interval);
  }, [sortBy]);

  /**
   * Filter and sort processes
   */
  useEffect(() => {
    let filtered = [...processes];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(process =>
        process.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        process.command.toLowerCase().includes(searchTerm.toLowerCase()) ||
        process.pid.toString().includes(searchTerm)
      );
    }

    // Apply user filter
    if (selectedUser !== 'all') {
      filtered = filtered.filter(process => process.user === selectedUser);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'cpu':
          aValue = a.cpu || 0;
          bValue = b.cpu || 0;
          break;
        case 'memory':
          aValue = a.memory || a.memoryMB || 0;
          bValue = b.memory || b.memoryMB || 0;
          break;
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'pid':
          aValue = a.pid;
          bValue = b.pid;
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredProcesses(filtered);
  }, [processes, searchTerm, selectedUser, sortBy, sortOrder]);

  /**
   * Get unique users from processes
   */
  const getUniqueUsers = () => {
    const users = [...new Set(processes.map(p => p.user))];
    return users.filter(user => user && user !== 'unknown');
  };

  /**
   * Handle sort change
   */
  const handleSort = (newSortBy: typeof sortBy) => {
    if (newSortBy === sortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  /**
   * Get process status color
   */
  const getProcessStatusColor = (process: Process) => {
    if (process.cpu > 80) return 'text-red-600 dark:text-red-400';
    if (process.cpu > 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  if (loading && processes.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <Activity className="w-8 h-8 mr-3 text-green-600 dark:text-green-400" />
          Process Monitor
        </h2>

        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {filteredProcesses.length} of {processes.length} processes
          </span>
          <button
            onClick={() => { onRefresh(); fetchProcesses(); }}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search processes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* User Filter */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowUserFilter(!showUserFilter)}
              className="inline-flex items-center px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </button>

            {showUserFilter && (
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Users</option>
                {getUniqueUsers().map(user => (
                  <option key={user} value={user}>{user}</option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Process Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {filteredProcesses.length > 0 ? (
          <>
            {/* Table Header */}
            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3 border-b border-gray-200 dark:border-gray-600">
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                <button
                  onClick={() => handleSort('pid')}
                  className="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  <span>PID</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>

                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  <span>Process</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>

                <button
                  onClick={() => handleSort('cpu')}
                  className="hidden sm:flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  <span>CPU %</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>

                <button
                  onClick={() => handleSort('memory')}
                  className="hidden sm:flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  <span>Memory</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>

                <div className="hidden lg:block">User</div>
                <div className="hidden lg:block">Command</div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto">
              {filteredProcesses.slice(0, 50).map((process) => (
                <div
                  key={process.pid}
                  className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 items-center">
                    {/* PID */}
                    <div className="font-mono text-sm text-gray-900 dark:text-white">
                      {process.pid}
                    </div>

                    {/* Process Name */}
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white truncate">
                        {process.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 sm:hidden">
                        {process.cpu || 0}% CPU • {formatBytes((process.memoryMB || process.memory || 0) * 1024 * 1024)}
                      </div>
                    </div>

                    {/* CPU Usage */}
                    <div className="hidden sm:block">
                      <div className={`font-medium ${getProcessStatusColor(process)}`}>
                        {process.cpu || 0}%
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 mt-1">
                        <div
                          className={`h-1.5 rounded-full transition-all duration-300 ${(process.cpu || 0) > 80 ? 'bg-red-500' :
                              (process.cpu || 0) > 50 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                          style={{ width: `${Math.min(process.cpu || 0, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Memory Usage */}
                    <div className="hidden sm:block">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {formatBytes((process.memoryMB || process.memory || 0) * 1024 * 1024)}
                      </div>
                    </div>

                    {/* User */}
                    <div className="hidden lg:flex items-center space-x-1">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900 dark:text-white">
                        {process.user || 'unknown'}
                      </span>
                    </div>

                    {/* Command */}
                    <div className="hidden lg:block">
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate font-mono">
                        {process.command || process.name}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Activity className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm || selectedUser !== 'all'
                  ? 'No processes match your filters'
                  : 'No processes found'
                }
              </p>
              {(searchTerm || selectedUser !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedUser('all');
                  }}
                  className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Process Summary */}
      {processes.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Process Summary
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {processes.length}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Processes</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {processes.filter(p => (p.cpu || 0) < 10).length}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Low CPU</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {processes.filter(p => (p.cpu || 0) >= 10 && (p.cpu || 0) < 50).length}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Medium CPU</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {processes.filter(p => (p.cpu || 0) >= 50).length}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">High CPU</div>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <h3 className="text-lg font-medium text-red-800 dark:text-red-200">
              Process monitoring error
            </h3>
          </div>
          <p className="mt-2 text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}
    </div>
  );
};

export default ProcessList;