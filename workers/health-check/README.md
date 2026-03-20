# AIReady Health Check Worker

Cloudflare Worker with Cron Trigger to monitor the health of AIReady domains.

## Monitored Endpoints

| Domain                   | Project             | Type           |
| ------------------------ | ------------------- | -------------- |
| getaiready.dev           | landing (monorepo)  | Marketing site |
| platform.getaiready.dev  | platform (monorepo) | Platform       |
| clawmore.getaiready.dev  | clawmore (monorepo) | ClawMore       |
| superclaw.getaiready.dev | serverlessclaw      | ServerlessClaw |

## DNS Records (Current Configuration)

All domains point to CloudFront distributions:

- getaiready.dev → d2w0mm0ew66i5h.cloudfront.net
- platform.getaiready.dev → d1x0kp8rtmrwy5.cloudfront.net
- clawmore.getaiready.dev → dzbv5yf097x2k.cloudfront.net
- superclaw.getaiready.dev → d376sswipw8x0a.cloudfront.net
- api.superclaw.getaiready.dev → d-3iss91a9qi.execute-api.ap-southeast-2.amazonaws.com

## Deployment

### Prerequisites

- Cloudflare account
- wrangler CLI installed: `npm install -g wrangler`

### Configure Cloudflare API Token

Set the Cloudflare API token in your environment:

```bash
export CLOUDFLARE_API_TOKEN="your-token"
```

Or create a `.dev.vars` file:

```bash
CLOUDFLARE_API_TOKEN="your-token"
```

### Deploy the Worker

From the monorepo root:

```bash
# Install dependencies (uses pnpm from monorepo)
pnpm install

# Deploy the health-check worker
pnpm --filter @aiready/health-check deploy
```

Or from the worker directory:

```bash
cd workers/health-check
pnpm deploy
```

This will:

1. Upload the Worker to Cloudflare
2. Configure the Cron Trigger to run every 5 minutes

### View Logs

After deployment, you can view logs in the Cloudflare Dashboard:

1. Go to Workers & Pages → aiready-health-check
2. Click "Logs" to see real-time logs

## Configuration

### Cron Schedule

The worker runs every 5 minutes by default. To change this, edit `wrangler.toml`:

```toml
[triggers]
crons = ["*/5 * * * *"]  # Every 5 minutes
```

Other cron options:

- `"*/1 * * * *"` - Every minute
- `"*/15 * * * *"` - Every 15 minutes
- `"0 * * * *"` - Every hour

### Email Notifications (Free - healthchecks.io)

We use [healthchecks.io](https://healthchecks.io) for **free email alerts**:

1. **Create account** at [healthchecks.io](https://healthchecks.io) (free tier: 3 checks)
2. **Create a check** named "AIReady Health"
3. **Copy the ping URL** (e.g., `https://hc-ping.com/your-uuid`)
4. **Configure the secret**:

```bash
cd workers/health-check
wrangler secret put HEALTHCHECKS_URL
# Enter: https://hc-ping.com/your-uuid
```

That's it! healthchecks.io will:

- Monitor that your worker runs every 5 minutes
- Send **email alerts** when the check fails (no ping received)
- Provide a **dashboard** with uptime history

## Testing

### Manual Test (HTTP)

```bash
curl https://aiready-health-check.your-account.workers.dev
```

### Local Development

```bash
npm run dev
```

This will start a local server at http://localhost:8787

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Cloudflare Worker                       │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Cron Trigger (every 5 min)                     │   │
│  └─────────────────────────────────────────────────┘   │
│                         │                                │
│                         ▼                                │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Health Check Queue                             │   │
│  │  • getaiready.dev                               │   │
│  │  • platform.getaiready.dev                      │   │
│  │  • clawmore.getaiready.dev                      │   │
│  │  • superclaw.getaiready.dev                     │   │
│  └─────────────────────────────────────────────────┘   │
│                         │                                │
│                         ▼                                │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Results                                        │   │
│  │  • Log to Cloudflare Logs                      │   │
│  │  • (Optional) Send to Slack/Discord webhook   │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## Cloudflare Zone Information

- Zone ID: 50eb7dcadc84c58ab34583742db0b671
- Account ID: f471d26de9c33198fda2fa5609ada497
