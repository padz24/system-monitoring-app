/**
 * Utility Functions for Data Formatting
 * Common formatting functions for the monitoring application
 */

/**
 * Format bytes into human readable string
 * @param bytes - Number of bytes
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string (e.g., "1.23 GB")
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Format uptime seconds into human readable string
 * @param seconds - Uptime in seconds
 * @returns Formatted uptime string (e.g., "2d 5h 30m")
 */
export function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  const parts: string[] = [];
  
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  
  return parts.length > 0 ? parts.join(' ') : '0m';
}

/**
 * Format percentage with appropriate color coding
 * @param percentage - Percentage value (0-100)
 * @returns Object with formatted value and color class
 */
export function formatPercentage(percentage: number) {
  const rounded = Math.round(percentage);
  
  let colorClass = 'text-green-600 dark:text-green-400';
  if (percentage > 75) {
    colorClass = 'text-red-600 dark:text-red-400';
  } else if (percentage > 50) {
    colorClass = 'text-yellow-600 dark:text-yellow-400';
  }
  
  return {
    value: `${rounded}%`,
    colorClass,
    level: percentage > 75 ? 'high' : percentage > 50 ? 'medium' : 'low'
  };
}

/**
 * Format timestamp into locale string
 * @param timestamp - ISO timestamp string or Date object
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted time string
 */
export function formatTimestamp(
  timestamp: string | Date,
  options?: Intl.DateTimeFormatOptions
): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    ...options
  };
  
  return date.toLocaleTimeString(undefined, defaultOptions);
}

/**
 * Format CPU frequency
 * @param hz - Frequency in Hz
 * @returns Formatted frequency string
 */
export function formatFrequency(hz: number): string {
  if (hz >= 1000000000) {
    return `${(hz / 1000000000).toFixed(2)} GHz`;
  } else if (hz >= 1000000) {
    return `${(hz / 1000000).toFixed(0)} MHz`;
  } else if (hz >= 1000) {
    return `${(hz / 1000).toFixed(0)} KHz`;
  } else {
    return `${hz} Hz`;
  }
}

/**
 * Format process command for display (truncate if too long)
 * @param command - Process command string
 * @param maxLength - Maximum length (default: 50)
 * @returns Truncated command string
 */
export function formatCommand(command: string, maxLength: number = 50): string {
  if (command.length <= maxLength) {
    return command;
  }
  
  return command.substring(0, maxLength - 3) + '...';
}

/**
 * Get status badge configuration based on percentage
 * @param percentage - Usage percentage
 * @returns Object with badge text and CSS classes
 */
export function getStatusBadge(percentage: number) {
  if (percentage < 60) {
    return {
      text: 'Normal',
      className: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
    };
  } else if (percentage < 80) {
    return {
      text: 'High',
      className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200'
    };
  } else {
    return {
      text: 'Critical',
      className: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200'
    };
  }
}

/**
 * Debounce function for performance optimization
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): T {
  let timeout: NodeJS.Timeout;
  
  return ((...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  }) as T;
}