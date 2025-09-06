/**
 * System Overview Component
 * Displays comprehensive system information in a dashboard layout
 * Optimized for mobile and desktop viewing
 */

import React from 'react';
import { 
  Cpu, 
  HardDrive, 
  Monitor, 
  Server, 
  Thermometer,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import { formatBytes } from '../utils/formatters';

interface SystemOverviewProps {
  data: any;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

const SystemOverview: React.FC<SystemOverviewProps> = ({
  data,
  loading,
  error,
  onRefresh
}) => {
  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
          <h3 className="text-lg font-medium text-red-800 dark:text-red-200">
            Failed to load system data
          </h3>
        </div>
        <p className="mt-2 text-red-700 dark:text-red-300">{error}</p>
        <button
          onClick={onRefresh}
          className="mt-4 inline-flex items-center px-4 py-2 bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 rounded-md hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </button>
      </div>
    );
  }

  const system = data?.system;
  const cpu = data?.cpu;
  const memory = data?.memory;

  /**
   * Get status color based on usage percentage
   */
  const getStatusColor = (percentage: number) => {
    if (percentage < 60) return 'text-green-600 dark:text-green-400';
    if (percentage < 80) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  /**
   * Get status background color based on usage percentage
   */
  const getStatusBgColor = (percentage: number) => {
    if (percentage < 60) return 'bg-green-100 dark:bg-green-900/20';
    if (percentage < 80) return 'bg-yellow-100 dark:bg-yellow-900/20';
    return 'bg-red-100 dark:bg-red-900/20';
  };

  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          System Overview
        </h2>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* System Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* System Info Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              System Info
            </h3>
            <Server className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          
          {system ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Platform:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {system.platform}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Architecture:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {system.architecture}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Hostname:</span>
                <span className="font-medium text-gray-900 dark:text-white truncate">
                  {system.hostname}
                </span>
              </div>
              {system.osName && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">OS:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {system.osName}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-500 dark:text-gray-400">Loading...</div>
          )}
        </div>

        {/* CPU Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              CPU Usage
            </h3>
            <Cpu className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          
          {cpu ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {cpu.usage}%
                </span>
                <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusBgColor(cpu.usage)} ${getStatusColor(cpu.usage)}`}>
                  {cpu.usage < 60 ? 'Normal' : cpu.usage < 80 ? 'High' : 'Critical'}
                </span>
              </div>
              
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-300 ${
                    cpu.usage < 60 ? 'bg-green-500' : cpu.usage < 80 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(cpu.usage, 100)}%` }}
                />
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Cores:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{cpu.cores}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Model:</span>
                  <span className="font-medium text-gray-900 dark:text-white truncate">
                    {cpu.model?.split(' ')[0] || 'Unknown'}
                  </span>
                </div>
                {cpu.temperature && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Temperature:</span>
                    <div className="flex items-center space-x-1">
                      <Thermometer className="w-3 h-3" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {cpu.temperature}°C
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-gray-500 dark:text-gray-400">Loading...</div>
          )}
        </div>

        {/* Memory Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Memory Usage
            </h3>
            <HardDrive className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          
          {memory ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {memory.percentage}%
                </span>
                <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusBgColor(memory.percentage)} ${getStatusColor(memory.percentage)}`}>
                  {memory.percentage < 60 ? 'Normal' : memory.percentage < 80 ? 'High' : 'Critical'}
                </span>
              </div>
              
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-300 ${
                    memory.percentage < 60 ? 'bg-purple-500' : memory.percentage < 80 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(memory.percentage, 100)}%` }}
                />
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Used:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatBytes(memory.used * 1024 * 1024)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Free:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatBytes(memory.free * 1024 * 1024)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatBytes(memory.total * 1024 * 1024)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-500 dark:text-gray-400">Loading...</div>
          )}
        </div>
      </div>

      {/* Additional System Stats */}
      {system && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Monitor className="w-5 h-5 mr-2" />
            Additional Information
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Memory</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {system.totalMemory} GB
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">CPU Cores</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {system.cpuCount}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Node Version</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {system.nodeVersion}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Network Interfaces</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {system.networkInterfaces}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemOverview;