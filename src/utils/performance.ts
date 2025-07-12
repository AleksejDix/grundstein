interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  route?: string;
}

interface PerformanceConfig {
  enabled: boolean;
  sampleRate: number;
  endpoint?: string;
}

const config: PerformanceConfig = {
  enabled: import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true',
  sampleRate: 0.1, // 10% sampling rate
  endpoint: import.meta.env.VITE_PERFORMANCE_ENDPOINT,
};

const metrics: PerformanceMetric[] = [];

export const performanceMonitor = {
  init(): void {
    if (!config.enabled || !('performance' in window)) return;

    // Core Web Vitals
    this.observeWebVitals();
    
    // Navigation timing
    this.observeNavigation();
    
    // Resource timing
    this.observeResources();
    
    // Send metrics periodically
    setInterval(() => this.sendMetrics(), 30000); // Every 30 seconds
  },

  observeWebVitals(): void {
    if (!('PerformanceObserver' in window)) return;

    // Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.recordMetric('LCP', entry.startTime);
      }
    });
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

    // First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.recordMetric('FID', (entry as any).processingStart - entry.startTime);
      }
    });
    fidObserver.observe({ type: 'first-input', buffered: true });

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      this.recordMetric('CLS', clsValue);
    });
    clsObserver.observe({ type: 'layout-shift', buffered: true });
  },

  observeNavigation(): void {
    if (!performance.getEntriesByType) return;

    const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (navEntries.length === 0) return;

    const nav = navEntries[0];
    
    this.recordMetric('DNS', nav.domainLookupEnd - nav.domainLookupStart);
    this.recordMetric('TCP', nav.connectEnd - nav.connectStart);
    this.recordMetric('TLS', nav.connectEnd - nav.secureConnectionStart);
    this.recordMetric('TTFB', nav.responseStart - nav.requestStart);
    this.recordMetric('DOMContentLoaded', nav.domContentLoadedEventEnd - nav.navigationStart);
    this.recordMetric('Load', nav.loadEventEnd - nav.navigationStart);
  },

  observeResources(): void {
    if (!('PerformanceObserver' in window)) return;

    const resourceObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const resource = entry as PerformanceResourceTiming;
        
        // Track slow resources (>1s)
        if (resource.duration > 1000) {
          this.recordMetric('SlowResource', resource.duration, window.location.pathname);
        }
        
        // Track failed resources
        if (resource.transferSize === 0 && resource.decodedBodySize === 0) {
          this.recordMetric('FailedResource', 1, window.location.pathname);
        }
      }
    });
    resourceObserver.observe({ type: 'resource', buffered: true });
  },

  recordMetric(name: string, value: number, route?: string): void {
    if (Math.random() > config.sampleRate) return; // Sampling

    metrics.push({
      name,
      value,
      timestamp: Date.now(),
      route: route || window.location.pathname,
    });

    // Keep only last 100 metrics in memory
    if (metrics.length > 100) {
      metrics.splice(0, 50);
    }
  },

  async sendMetrics(): Promise<void> {
    if (!config.endpoint || metrics.length === 0) return;

    const payload = {
      metrics: [...metrics],
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: Date.now(),
    };

    try {
      await fetch(config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      // Clear sent metrics
      metrics.length = 0;
    } catch (error) {
      console.warn('Failed to send performance metrics:', error);
    }
  },

  // Manual performance tracking for custom events
  startTimer(name: string): () => void {
    const startTime = performance.now();
    return () => {
      const endTime = performance.now();
      this.recordMetric(name, endTime - startTime);
    };
  },

  // Track route changes
  trackRouteChange(route: string): void {
    this.recordMetric('RouteChange', performance.now(), route);
  },

  // Get current metrics (for debugging)
  getMetrics(): PerformanceMetric[] {
    return [...metrics];
  },
};