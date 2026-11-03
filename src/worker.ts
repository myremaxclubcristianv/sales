/**
 * Cloudflare Worker Custom Entrypoint for CRM SALES
 *
 * Re-exports the OpenNext Next.js HTTP handler and Durable Objects,
 * while providing native Cloudflare Scheduled Events (Cron Triggers) support.
 */

// @ts-ignore .open-next/worker.js is generated at build time by opennextjs-cloudflare
import { default as openNextHandler } from '../.open-next/worker.js'

// Re-export Durable Objects required by OpenNext cache and queue layers
// @ts-ignore
export { DOQueueHandler, DOShardedTagCache, BucketCachePurge } from '../.open-next/worker.js'

export default {
  // Delegate all standard HTTP requests transparently to Next.js via OpenNext
  fetch: openNextHandler.fetch,

  // Handle Cloudflare Cron Triggers / Scheduled Events
  async scheduled(controller: ScheduledController, env: CloudflareEnv, ctx: ExecutionContext): Promise<void> {
    const cronSecret = (env as Record<string, unknown>).CRON_SECRET as string | undefined

    if (!cronSecret || !cronSecret.trim()) {
      console.warn('[Cloudflare Scheduled Event] Skipped: CRON_SECRET is not configured in Worker environment bindings.')
      return
    }

    const cronUrl = 'https://crm-platform/api/reminders/check'
    const cronRequest = new Request(cronUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cronSecret.trim()}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Cloudflare-Worker-Scheduled-Trigger/1.0',
      },
    })

    const runScheduledCheck = async () => {
      try {
        const response = await openNextHandler.fetch(cronRequest, env, ctx)
        if (!response.ok) {
          console.error(`[Cloudflare Scheduled Event] Reminder check failed with HTTP ${response.status}`)
        } else {
          console.log(`[Cloudflare Scheduled Event] Reminder check executed successfully with HTTP ${response.status}`)
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        console.error('[Cloudflare Scheduled Event] Execution error:', errorMsg)
      }
    }

    ctx.waitUntil(runScheduledCheck())
  },
}
