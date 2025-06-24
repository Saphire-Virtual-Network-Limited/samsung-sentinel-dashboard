import { useCallback, useRef } from 'react';

interface PerformanceMetrics {
  startTime: number;
  endTime?: number;
  duration?: number;
  success: boolean;
  error?: string;
}

export function usePerformanceMonitor() {
  const metricsRef = useRef<PerformanceMetrics[]>([]);

  const startTimer = useCallback(() => {
    const startTime = performance.now();
    const metric: PerformanceMetrics = {
      startTime,
      success: false,
    };
    metricsRef.current.push(metric);
    return metricsRef.current.length - 1; // Return index
  }, []);

  const endTimer = useCallback((index: number, success: boolean, error?: string) => {
    if (metricsRef.current[index]) {
      const endTime = performance.now();
      metricsRef.current[index] = {
        ...metricsRef.current[index],
        endTime,
        duration: endTime - metricsRef.current[index].startTime,
        success,
        error,
      };
    }
  }, []);

  const getAverageResponseTime = useCallback(() => {
    const successfulRequests = metricsRef.current.filter(m => m.success && m.duration);
    if (successfulRequests.length === 0) return 0;
    
    const totalDuration = successfulRequests.reduce((sum, m) => sum + (m.duration || 0), 0);
    return totalDuration / successfulRequests.length;
  }, []);

  const getRecentMetrics = useCallback((count: number = 10) => {
    return metricsRef.current.slice(-count);
  }, []);

  const clearMetrics = useCallback(() => {
    metricsRef.current = [];
  }, []);

  return {
    startTimer,
    endTimer,
    getAverageResponseTime,
    getRecentMetrics,
    clearMetrics,
  };
} 