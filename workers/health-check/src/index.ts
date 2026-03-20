/**
 * AIReady Health Check Worker
 *
 * Cron Trigger: Runs every 5 minutes to check health of all endpoints
 * Endpoints monitored:
 * - getaiready.dev (landing)
 * - platform.getaiready.dev (platform)
 * - clawmore.getaiready.dev (clawmore)
 * - superclaw.getaiready.dev (serverlessclaw)
 *
 * Notifications: Publishes to AWS SNS topic for email alerts
 */

interface HealthCheckResult {
  url: string;
  status: 'healthy' | 'unhealthy' | 'error';
  statusCode?: number;
  responseTime?: number;
  timestamp: string;
  error?: string;
}

// Endpoints to monitor
const ENDPOINTS = [
  'https://getaiready.dev',
  'https://platform.getaiready.dev',
  'https://clawmore.getaiready.dev',
  'https://superclaw.getaiready.dev',
];

// Timeout for each health check (ms)
const TIMEOUT = 10000;

/**
 * Check health of a single endpoint
 */
async function checkEndpoint(url: string): Promise<HealthCheckResult> {
  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const responseTime = Date.now() - startTime;
    const isHealthy = response.status >= 200 && response.status < 400;

    return {
      url,
      status: isHealthy ? 'healthy' : 'unhealthy',
      statusCode: response.status,
      responseTime,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    return {
      url,
      status: 'error',
      responseTime,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Publish failure alert to SNS via API endpoint
 */
async function publishAlert(
  results: HealthCheckResult[],
  healthApiUrl?: string
): Promise<void> {
  if (!healthApiUrl) return;

  const failed = results.filter((r) => r.status !== 'healthy');
  if (failed.length === 0) return;

  const timestamp = new Date().toISOString();
  const subject = `⚠️ AIReady Alert: ${failed.length} site(s) down`;

  const payload = {
    subject,
    message: `Health check detected ${failed.length} unhealthy endpoint(s) at ${timestamp}`,
    failedUrls: failed.map((r) => r.url),
    details: failed.map((r) => ({
      url: r.url,
      status: r.status,
      statusCode: r.statusCode,
      error: r.error,
      responseTime: r.responseTime,
    })),
  };

  try {
    const response = await fetch(`${healthApiUrl}alert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      console.log(`Alert published successfully to SNS`);
    } else {
      console.error(
        `Failed to publish alert: ${response.status} ${response.statusText}`
      );
    }
  } catch (error) {
    console.error(`Error publishing alert: ${error}`);
  }
}

/**
 * Log results to console (viewable in Cloudflare Dashboard)
 */
function logResults(results: HealthCheckResult[]): void {
  const timestamp = new Date().toISOString();

  console.log(`=== Health Check Report: ${timestamp} ===`);

  let healthyCount = 0;
  let unhealthyCount = 0;
  let errorCount = 0;

  for (const result of results) {
    const statusIcon =
      result.status === 'healthy'
        ? '✅'
        : result.status === 'unhealthy'
          ? '⚠️'
          : '❌';
    const responseInfo = result.responseTime
      ? ` (${result.responseTime}ms)`
      : '';

    console.log(`${statusIcon} ${result.url}: ${result.status}${responseInfo}`);

    if (result.status === 'healthy') healthyCount++;
    else if (result.status === 'unhealthy') unhealthyCount++;
    else errorCount++;

    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
    if (result.statusCode) {
      console.log(`   Status: ${result.statusCode}`);
    }
  }

  console.log(
    `\nSummary: ${healthyCount} healthy, ${unhealthyCount} unhealthy, ${errorCount} errors`
  );
}

/**
 * Cron Trigger handler - runs on schedule
 */
export default {
  async scheduled(
    event: ScheduledEvent,
    env: Env,
    ctx: unknown
  ): Promise<void> {
    console.log('Starting scheduled health check...');

    // Run all health checks in parallel
    const results = await Promise.all(
      ENDPOINTS.map((url) => checkEndpoint(url))
    );

    // Log results
    logResults(results);

    // Publish to SNS via API if configured
    const healthApiUrl = env.HEALTH_API_URL;
    if (healthApiUrl) {
      await publishAlert(results, healthApiUrl);
    }

    console.log('Health check completed');
  },

  // For manual testing via HTTP
  async fetch(event: FetchEvent): Promise<Response> {
    const results = await Promise.all(
      ENDPOINTS.map((url) => checkEndpoint(url))
    );
    logResults(results);

    return new Response(JSON.stringify(results, null, 2), {
      headers: { 'Content-Type': 'application/json' },
    });
  },
};

interface Env {
  HEALTH_API_URL?: string;
}

interface ScheduledEvent {
  cron?: string;
}

interface FetchEvent {
  request?: Request;
}
