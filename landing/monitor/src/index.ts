/**
 * AIReady Landing Health Monitor
 * Managed by: @aiready/landing
 */

interface HealthCheckResult {
  url: string;
  status: 'healthy' | 'unhealthy' | 'error';
  statusCode?: number;
  responseTime?: number;
  timestamp: string;
  error?: string;
}

const URL_TO_CHECK = 'https://getaiready.dev';
const TIMEOUT = 10000;

async function checkHealth(url: string): Promise<HealthCheckResult> {
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
    const isHealthy = response.status >= 200 && response.status < 400;

    return {
      url,
      status: isHealthy ? 'healthy' : 'unhealthy',
      statusCode: response.status,
      responseTime: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      url,
      status: 'error',
      responseTime: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function reportFailure(result: HealthCheckResult, healthApiUrl: string) {
  if (result.status === 'healthy') return;

  const payload = {
    subject: `⚠️ Landing Outage: ${result.url}`,
    message: `Health check failed for Landing Page at ${result.timestamp}`,
    failedUrls: [result.url],
    details: [result],
  };

  try {
    await fetch(`${healthApiUrl}/alert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    console.error('Failed to report failure:', e);
  }
}

export default {
  async scheduled(event: any, env: any, ctx: any) {
    const result = await checkHealth(URL_TO_CHECK);
    console.log(
      `${result.status === 'healthy' ? '✅' : '❌'} ${result.url}: ${result.status}`
    );

    if (result.status !== 'healthy') {
      await reportFailure(result, env.HEALTH_API_URL);
    }
  },

  async fetch(request: Request, env: any) {
    const result = await checkHealth(URL_TO_CHECK);
    return new Response(JSON.stringify(result, null, 2), {
      headers: { 'Content-Type': 'application/json' },
    });
  },
};
