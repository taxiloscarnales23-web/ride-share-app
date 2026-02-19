export interface PerformanceMetric {
  endpoint: string;
  method: string;
  duration: number;
  statusCode: number;
  timestamp: Date;
  error?: string;
}

export interface SystemHealth {
  uptime: number;
  memoryUsage: number;
  cpuUsage: number;
  activeConnections: number;
  requestsPerSecond: number;
  averageResponseTime: number;
  errorRate: number;
}

export interface ErrorLog {
  id: string;
  message: string;
  stack?: string;
  context: Record<string, any>;
  timestamp: Date;
  severity: "low" | "medium" | "high" | "critical";
}

// Store metrics in memory
const metrics: PerformanceMetric[] = [];
const errors: ErrorLog[] = [];
const requestCounts = new Map<string, number>();
let totalRequests = 0;
let startTime = Date.now();

// Record API performance metric
export function recordMetric(metric: PerformanceMetric): void {
  metrics.push(metric);
  totalRequests++;

  // Keep only last 1000 metrics
  if (metrics.length > 1000) {
    metrics.shift();
  }

  // Track requests per endpoint
  const key = `${metric.method} ${metric.endpoint}`;
  requestCounts.set(key, (requestCounts.get(key) || 0) + 1);
}

// Record error
export function recordError(error: ErrorLog): void {
  errors.push(error);

  // Keep only last 500 errors
  if (errors.length > 500) {
    errors.shift();
  }
}

// Get system health metrics
export function getSystemHealth(): SystemHealth {
  const uptime = (Date.now() - startTime) / 1000; // seconds
  const memUsage = process.memoryUsage();
  const memoryUsage = (memUsage.heapUsed / memUsage.heapTotal) * 100;

  // Calculate average response time
  const avgResponseTime =
    metrics.length > 0
      ? metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length
      : 0;

  // Calculate error rate
  const errorCount = metrics.filter((m) => m.statusCode >= 400).length;
  const errorRate =
    totalRequests > 0 ? (errorCount / totalRequests) * 100 : 0;

  // Calculate requests per second (last minute)
  const oneMinuteAgo = Date.now() - 60000;
  const recentRequests = metrics.filter((m) => m.timestamp.getTime() > oneMinuteAgo);
  const rps = recentRequests.length / 60;

  return {
    uptime,
    memoryUsage,
    cpuUsage: 0, // Would need native module for accurate CPU
    activeConnections: 0, // Would need to track from socket.io
    requestsPerSecond: rps,
    averageResponseTime: avgResponseTime,
    errorRate,
  };
}

// Get performance metrics for specific endpoint
export function getEndpointMetrics(endpoint: string, method?: string) {
  const filtered = metrics.filter(
    (m) =>
      m.endpoint === endpoint &&
      (!method || m.method === method)
  );

  if (filtered.length === 0) return null;

  const durations = filtered.map((m) => m.duration);
  const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
  const maxDuration = Math.max(...durations);
  const minDuration = Math.min(...durations);
  const errorCount = filtered.filter((m) => m.statusCode >= 400).length;

  return {
    endpoint,
    method,
    totalRequests: filtered.length,
    averageDuration: avgDuration,
    maxDuration,
    minDuration,
    errorCount,
    errorRate: (errorCount / filtered.length) * 100,
  };
}

// Get recent errors
export function getRecentErrors(limit: number = 50): ErrorLog[] {
  return errors.slice(-limit).reverse();
}

// Get errors by severity
export function getErrorsBySeverity(severity: string): ErrorLog[] {
  return errors.filter((e) => e.severity === severity);
}

// Get performance metrics summary
export function getPerformanceSummary() {
  const endpoints = new Set(metrics.map((m) => `${m.method} ${m.endpoint}`));
  const endpointMetrics = Array.from(endpoints)
    .map((ep) => {
      const [method, endpoint] = ep.split(" ");
      return getEndpointMetrics(endpoint, method);
    })
    .filter(Boolean);

  return {
    totalRequests,
    totalErrors: errors.length,
    uptime: (Date.now() - startTime) / 1000,
    topEndpoints: endpointMetrics
      .sort((a, b) => (b?.totalRequests || 0) - (a?.totalRequests || 0))
      .slice(0, 10),
    slowestEndpoints: endpointMetrics
      .sort((a, b) => (b?.averageDuration || 0) - (a?.averageDuration || 0))
      .slice(0, 5),
  };
}

// Middleware to track API performance
export function performanceTrackingMiddleware(
  req: any,
  res: any,
  next: any
) {
  const startTime = Date.now();
  const originalSend = res.send;

  res.send = function (data: any) {
    const duration = Date.now() - startTime;
    const metric: PerformanceMetric = {
      endpoint: req.path,
      method: req.method,
      duration,
      statusCode: res.statusCode,
      timestamp: new Date(),
    };

    recordMetric(metric);

    // Log slow requests (> 1000ms)
    if (duration > 1000) {
      console.warn(
        `[Performance] Slow request: ${req.method} ${req.path} took ${duration}ms`
      );
    }

    return originalSend.call(this, data);
  };

  next();
}

// Reset metrics
export function resetMetrics(): void {
  metrics.length = 0;
  errors.length = 0;
  requestCounts.clear();
  totalRequests = 0;
  startTime = Date.now();
}
