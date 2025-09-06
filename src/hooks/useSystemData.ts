/**
 * System Data Hook
 * Manages system information fetching and caching
 * Optimized for mobile and low-resource environments
 */

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

interface SystemData {
  system?: any;
  cpu?: any;
  memory?: any;
  timestamp?: string;
}

export function useSystemData() {
  const [systemData, setSystemData] = useState<SystemData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch system overview data
   */
  const fetchSystemData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get("http://localhost:5000/api/system/overview", {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = response.data; // axios udah otomatis parse

      setSystemData(data);

      // Log any errors from the API response
      if (data.errors && data.errors.length > 0) {
        console.warn("API returned errors:", data.errors);
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch system data";
      setError(errorMessage);
      console.error("System data fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch individual component data
   */
  const fetchComponentData = useCallback(async (component: "cpu" | "memory" | "uptime") => {
    try {
      const response = await axios.get(`http://localhost:5000/api/system/${component}`);
      const data = response.data; // axios auto-parse JSON

      // Update specific component in system data
      setSystemData(prev => ({
        ...prev,
        [component]: data,
        timestamp: new Date().toISOString(),
      }));
    } catch (err) {
      console.error(`Failed to fetch ${component} data:`, err);
    }
  }, []);

  /**
   * Refresh all data
   */
  const refreshData = useCallback(() => {
    fetchSystemData();
  }, [fetchSystemData]);

  /**
   * Check server health
   */
  const checkServerHealth = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/health");
      return response.status === 200; // axios kasih status langsung
    } catch {
      return false;
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchSystemData();
  }, [fetchSystemData]);

  // Periodic refresh (every 30 seconds to conserve resources)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        fetchSystemData();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchSystemData, loading]);

  // Health check on mount
  useEffect(() => {
    let mounted = true;

    const performHealthCheck = async () => {
      const isHealthy = await checkServerHealth();

      if (mounted && !isHealthy) {
        setError('Cannot connect to monitoring server. Please ensure the server is running on port 5000.');
      }
    };

    performHealthCheck();

    return () => {
      mounted = false;
    };
  }, [checkServerHealth]);

  return {
    systemData,
    loading,
    error,
    refreshData,
    fetchComponentData,
    checkServerHealth
  };
}