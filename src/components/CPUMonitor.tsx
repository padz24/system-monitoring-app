/**
 * CPU Monitor Component
 * Displays detailed CPU usage information with real-time charts
 * Optimized for low-resource environments
 */

import React, { useEffect, useState } from 'react';
import { Cpu, TrendingUp, Thermometer, Zap, Activity } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import LoadingSpinner from './LoadingSpinner';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface CPUMonitorProps {
  data: any;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

const CPUMonitor: React.FC<CPUMonitorProps> = ({
  data,
  loading,
  onRefresh
}) => {
  const [cpuHistory, setCpuHistory] = useState<number[]>([]);
  const [timeLabels, setTimeLabels] = useState<string[]>([]);
  const maxDataPoints = 20; // Limit to conserve memory
  
  /**
   * Update CPU history when new data arrives
   */
  useEffect(() => {
    if (data?.cpu?.usage !== undefined) {
      const currentTime = new Date().toLocaleTimeString();
      const usage = data.cpu.usage;
      
      setCpuHistory(prev => {
        const newHistory = [...prev, usage];
        return newHistory.slice(-maxDataPoints);
      });
      
      setTimeLabels(prev => {
        const newLabels = [...prev, currentTime];
        return newLabels.slice(-maxDataPoints);
      });
    }
  }, [data?.cpu?.usage]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  const cpu = data?.cpu;

  /**
   * Chart configuration
   */
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
        ticks: {
          maxTicksLimit: 6,
        },
      },
      y: {
        display: true,
        min: 0,
        max: 100,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
    elements: {
      line: {
        tension: 0.4,
      },
      point: {
        radius: 0,
        hoverRadius: 4,
      },
    },
    animation: {
      duration: 300,
    },
  };

  const chartData = {
    labels: timeLabels,
    datasets: [
      {
        label: 'CPU Usage (%)',
        data: cpuHistory,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
      },
    ],
  };

  /**
   * Get CPU status information
   */
  const getCPUStatus = () => {
    if (!cpu) return { status: 'Unknown', color: 'gray' };
    
    const usage = cpu.usage || 0;
    if (usage < 30) return { status: 'Idle', color: 'green' };
    if (usage < 60) return { status: 'Normal', color: 'blue' };
    if (usage < 80) return { status: 'High', color: 'yellow' };
    return { status: 'Critical', color: 'red' };
  };

  const cpuStatus = getCPUStatus();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <Cpu className="w-8 h-8 mr-3 text-blue-600 dark:text-blue-400" />
          CPU Monitor
        </h2>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* CPU Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Current Usage */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Usage
              </span>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${cpuStatus.color}-100 text-${cpuStatus.color}-800 dark:bg-${cpuStatus.color}-900/20 dark:text-${cpuStatus.color}-200`}>
              {cpuStatus.status}
            </span>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {cpu?.usage || 0}%
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-3">
            <div 
              className={`h-2 rounded-full transition-all duration-500 bg-${cpuStatus.color}-500`}
              style={{ width: `${Math.min(cpu?.usage || 0, 100)}%` }}
            />
          </div>
        </div>

        {/* Cores */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Cores
            </span>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {cpu?.cores || 0}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {cpu?.architecture || 'Unknown'} architecture
          </div>
        </div>

        {/* Speed */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Speed
            </span>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {cpu?.speed ? Math.round(cpu.speed / 1000) : 0}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            GHz base frequency
          </div>
        </div>

        {/* Temperature (if available) */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-2 mb-2">
            <Thermometer className="w-5 h-5 text-red-600 dark:text-red-400" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Temperature
            </span>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {cpu?.temperature || 'N/A'}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {cpu?.temperature ? '°C' : 'Not available'}
          </div>
        </div>
      </div>

      {/* CPU Usage Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          CPU Usage History
        </h3>
        
        <div className="h-64">
          {cpuHistory.length > 0 ? (
            <Line data={chartData} options={chartOptions} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Collecting CPU data...</p>
                <p className="text-sm mt-1">Real-time updates will appear here</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CPU Information */}
      {cpu && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            CPU Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Model
              </label>
              <p className="mt-1 text-gray-900 dark:text-white">
                {cpu.model || 'Unknown CPU Model'}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Architecture
              </label>
              <p className="mt-1 text-gray-900 dark:text-white">
                {cpu.architecture || 'Unknown'}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Base Speed
              </label>
              <p className="mt-1 text-gray-900 dark:text-white">
                {cpu.speed ? `${cpu.speed} MHz` : 'Unknown'}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Status
              </label>
              <p className="mt-1 text-gray-900 dark:text-white">
                {cpuStatus.status} ({cpu.usage || 0}% usage)
              </p>
            </div>
          </div>
          
          {cpu.fallback && (
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Note:</strong> Limited CPU information available. Some features may not work in restricted environments like Termux.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CPUMonitor;