/**
 * Main Application Component
 * System Monitoring Dashboard
 * Optimized for mobile devices and low-resource environments
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Activity, Cpu, HardDrive, Monitor, Smartphone, Wifi } from 'lucide-react';
import SystemOverview from './components/SystemOverview';
import CPUMonitor from './components/CPUMonitor';
import MemoryMonitor from './components/MemoryMonitor';
import ProcessList from './components/ProcessList';
import ErrorBoundary from './components/ErrorBoundary';
import { useWebSocket } from './hooks/useWebSocket';
import { useSystemData } from './hooks/useSystemData';

/**
 * Navigation tab configuration
 */
const tabs = [
  { id: 'overview', name: 'Overview', icon: Monitor },
  { id: 'cpu', name: 'CPU', icon: Cpu },
  { id: 'memory', name: 'Memory', icon: HardDrive },
  { id: 'processes', name: 'Processes', icon: Activity },
];

function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobile, setIsMobile] = useState(false);
  
  // Custom hooks for data management
  const { systemData, loading, error, refreshData } = useSystemData();
  const { connected, lastUpdate } = useWebSocket();

  /**
   * Handle responsive design
   */
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  /**
   * Render active tab content
   */
  const renderTabContent = useCallback(() => {
    const commonProps = { 
      data: systemData, 
      loading, 
      error, 
      onRefresh: refreshData 
    };

    switch (activeTab) {
      case 'overview':
        return <SystemOverview {...commonProps} />;
      case 'cpu':
        return <CPUMonitor {...commonProps} />;
      case 'memory':
        return <MemoryMonitor {...commonProps} />;
      case 'processes':
        return <ProcessList {...commonProps} />;
      default:
        return <SystemOverview {...commonProps} />;
    }
  }, [activeTab, systemData, loading, error, refreshData]);

  /**
   * Get connection status color
   */
  const getConnectionStatus = () => {
    if (connected) {
      return { color: 'text-green-500', text: 'Connected' };
    }
    return { color: 'text-red-500', text: 'Disconnected' };
  };

  const connectionStatus = getConnectionStatus();

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo and Title */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Smartphone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                    System Monitor
                  </h1>
                  {!isMobile && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Lightweight monitoring for Android & VPS
                    </p>
                  )}
                </div>
              </div>

              {/* Connection Status */}
              <div className="flex items-center space-x-2">
                <Wifi className={`w-4 h-4 ${connectionStatus.color}`} />
                {!isMobile && (
                  <span className={`text-sm font-medium ${connectionStatus.color}`}>
                    {connectionStatus.text}
                  </span>
                )}
                {lastUpdate && !isMobile && (
                  <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">
                    {new Date(lastUpdate).toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-0 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200
                      ${isActive
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300'
                      }
                      ${isMobile ? 'flex-col space-y-1 min-w-[80px]' : 'flex-row space-x-2'}
                    `}
                  >
                    <Icon className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4'} flex-shrink-0`} />
                    <span className={isMobile ? 'text-xs' : ''}>{tab.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {renderTabContent()}
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Optimized for Termux, VPS & Windows environments
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <span>Platform: {navigator.platform}</span>
                <span>•</span>
                <span>React + Node.js</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}

export default App;