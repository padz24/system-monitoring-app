/**
 * Memory Monitor Component
 * Displays detailed memory usage information with visualizations
 * Optimized for mobile viewing and low resource usage
 */

import React, { useEffect, useState } from 'react';
import { HardDrive, BarChart3, Database, Layers } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import LoadingSpinner from './LoadingSpinner';
import { formatBytes } from '../utils/formatters';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface MemoryMonitorProps {
  data: any;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

const MemoryMonitor: React.FC<MemoryMonitorProps> = ({
  data,
  loading,
  onRefresh
}) => {
  const [memoryHistory, setMemoryHistory] = useState<number[]>([]);
  const [timeLabels, setTimeLabels] = useState<string[]>([]);
  const maxDataPoints = 15;

  /**
   * Update memory history when new data arrives
   */
  useEffect(() => {
    if (data?.memory?.percentage !== undefined) {
      const currentTime = new Date().toLocaleTimeString();
      const usage = data.memory.percentage;

      setMemoryHistory(prev => {
        const newHistory = [...prev, usage];
        return newHistory.slice(-maxDataPoints);
      });

      setTimeLabels(prev => {
        const newLabels = [...prev, currentTime];
        return newLabels.slice(-maxDataPoints);
      });
    }
  }, [data?.memory?.percentage]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  const memory = data?.memory;

  /**
   * Get memory status color based on usage
   */
  const getMemoryStatus = () => {
    if (!memory) return { status: 'Unknown', color: 'gray' };

    const usage = memory.percentage || 0;
    if (usage < 50) return { status: 'Optimal', color: 'green' };
    if (usage < 75) return { status: 'Good', color: 'blue' };
    if (usage < 90) return { status: 'High', color: 'yellow' };
    return { status: 'Critical', color: 'red' };
  };

  const statusColors: Record<string, string> = {
    Optimal: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200",
    Good: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200",
    High: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200",
    Critical: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200",
  };


  const memoryStatus = getMemoryStatus();

  /**
   * Doughnut chart data for memory breakdown
   */
  const doughnutData = memory ? {
    labels: ['Used', 'Free', 'Buffers', 'Cached'],
    datasets: [
      {
        data: [
          memory.used || 0,
          memory.free || 0,
          memory.buffers || 0,
          memory.cached || 0
        ],
        backgroundColor: [
          '#ef4444', // Red for used
          '#10b981', // Green for free
          '#3b82f6', // Blue for buffers
          '#8b5cf6', // Purple for cached
        ],
        borderWidth: 0,
      },
    ],
  } : null;

  /**
   * Bar chart data for memory usage history
   */
  const barData = {
    labels: timeLabels,
    datasets: [
      {
        label: 'Memory Usage (%)',
        data: memoryHistory,
        backgroundColor: memoryHistory.map(usage =>
          usage < 50 ? '#10b981' :
            usage < 75 ? '#3b82f6' :
              usage < 90 ? '#f59e0b' : '#ef4444'
        ),
        borderColor: '#374151',
        borderWidth: 1,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function (value: any) {
            return value + '%';
          },
        },
      },
      x: {
        ticks: {
          maxTicksLimit: 6,
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const value = context.raw;
            return `${context.label}: ${formatBytes(value * 1024 * 1024)}`;
          },
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <HardDrive className="w-8 h-8 mr-3 text-purple-600 dark:text-purple-400" />
          Memory Monitor
        </h2>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg transition-colors"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Memory Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Memory */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-2 mb-2">
            <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {memory ? formatBytes(memory.total * 1024 * 1024) : '0 B'}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            System memory
          </div>
        </div>

        {/* Used Memory */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-red-600 dark:text-red-400" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Used
              </span>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[memoryStatus.status]}`}>
              {memoryStatus.status}
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {memory ? formatBytes(memory.used * 1024 * 1024) : '0 B'}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {memory?.percentage || 0}% of total
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-3">
            <div
              className={`h-2 rounded-full transition-all duration-500 bg-${memoryStatus.color}-500`}
              style={{ width: `${Math.min(memory?.percentage || 0, 100)}%` }}
            />
          </div>
        </div>

        {/* Free Memory */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-2 mb-2">
            <Layers className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Free
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {memory ? formatBytes(memory.free * 1024 * 1024) : '0 B'}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Available memory
          </div>
        </div>

        {/* Available Memory */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-2 mb-2">
            <Database className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Available
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {memory?.available ? formatBytes(memory.available * 1024 * 1024) : 'N/A'}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {memory?.available ? 'Including buffers/cache' : 'Not available'}
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Memory Usage History */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Usage History
          </h3>

          <div className="h-64">
            {memoryHistory.length > 0 ? (
              <Bar data={barData} options={barOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Collecting memory data...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Memory Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Memory Breakdown
          </h3>

          <div className="h-64">
            {doughnutData ? (
              <Doughnut data={doughnutData} options={doughnutOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <HardDrive className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Memory breakdown not available</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Memory Information */}
      {memory && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Detailed Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">System Memory</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total:</span>
                  <span className="font-medium text-gray-600 dark:text-gray-400">{formatBytes(memory.total * 1024 * 1024)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Used:</span>
                  <span className="font-medium text-gray-600 dark:text-gray-400">{formatBytes(memory.used * 1024 * 1024)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Free:</span>
                  <span className="font-medium text-gray-600 dark:text-gray-400">{formatBytes(memory.free * 1024 * 1024)}</span>
                </div>
              </div>
            </div>

            {(memory.buffers || memory.cached) && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Cache & Buffers</h4>
                <div className="space-y-2">
                  {memory.buffers && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Buffers:</span>
                      <span className="font-medium">{formatBytes(memory.buffers * 1024 * 1024)}</span>
                    </div>
                  )}
                  {memory.cached && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Cached:</span>
                      <span className="font-medium">{formatBytes(memory.cached * 1024 * 1024)}</span>
                    </div>
                  )}
                  {memory.available && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Available:</span>
                      <span className="font-medium">{formatBytes(memory.available * 1024 * 1024)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {(memory.swapTotal || memory.swapUsed) && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Swap Memory</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total:</span>
                    <span className="font-medium">
                      {memory.swapTotal ? formatBytes(memory.swapTotal * 1024 * 1024) : '0 B'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Used:</span>
                    <span className="font-medium">
                      {memory.swapUsed ? formatBytes(memory.swapUsed * 1024 * 1024) : '0 B'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Free:</span>
                    <span className="font-medium">
                      {memory.swapFree ? formatBytes(memory.swapFree * 1024 * 1024) : '0 B'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {memory.fallback && (
            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Note:</strong> Limited memory information available. Advanced features may not work in restricted environments.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MemoryMonitor;