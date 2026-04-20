/**
 * Central error reporting surface.
 *
 * Why: every `.catch(() => {})` in the codebase is a blind spot — the app
 * silently degrades and we have no record of why. This module gives us one
 * call site that:
 *   1. Logs a structured record in dev (scope, context, stack)
 *   2. Deduplicates (same scope+message within 5s fires once)
 *   3. Stores the last N records in a ring buffer for later retrieval
 *   4. Forwards to an optional external sink (Sentry, Datadog, custom)
 *
 * The log level is chosen automatically: `warn` for expected degradations
 * (autoplay blocked, wake-lock denied, storage full), `error` for anything
 * else. Call sites should pass `severity: 'warn'` when the failure is an
 * expected platform/user scenario rather than a real bug.
 */

export type ErrorSeverity = 'warn' | 'error'

export interface ErrorReport {
  scope: string
  message: string
  stack?: string
  context?: Record<string, unknown>
  severity: ErrorSeverity
  at: number
}

export type ErrorSink = (report: ErrorReport) => void

const MAX_BUFFER = 40
const DEDUP_WINDOW_MS = 5_000

const buffer: ErrorReport[] = []
const lastSeen = new Map<string, number>()
const sinks: ErrorSink[] = []

function messageFromUnknown(err: unknown): { message: string; stack?: string } {
  if (err instanceof Error) return { message: err.message, stack: err.stack }
  if (typeof err === 'string') return { message: err }
  try {
    return { message: JSON.stringify(err) }
  } catch {
    return { message: String(err) }
  }
}

export interface ReportOptions {
  severity?: ErrorSeverity
  context?: Record<string, unknown>
}

export function reportError(
  scope: string,
  err: unknown,
  options: ReportOptions = {},
): void {
  const { message, stack } = messageFromUnknown(err)
  const severity: ErrorSeverity = options.severity ?? 'error'
  const now = Date.now()

  const dedupKey = `${scope}::${severity}::${message}`
  const last = lastSeen.get(dedupKey)
  if (last !== undefined && now - last < DEDUP_WINDOW_MS) return
  lastSeen.set(dedupKey, now)

  const report: ErrorReport = {
    scope,
    message,
    stack,
    context: options.context,
    severity,
    at: now,
  }

  buffer.push(report)
  if (buffer.length > MAX_BUFFER) buffer.shift()

  const method: 'warn' | 'error' = severity === 'warn' ? 'warn' : 'error'
  if (stack && severity === 'error') {
    console[method](`[${scope}] ${message}`, options.context ?? '', '\n', stack)
  } else {
    console[method](`[${scope}] ${message}`, options.context ?? '')
  }

  for (const sink of sinks) {
    try {
      sink(report)
    } catch {
      /* never let a sink break the app */
    }
  }
}

/** Snapshot of the ring buffer — useful for a dev panel or a debug export. */
export function getErrorBuffer(): readonly ErrorReport[] {
  return buffer.slice()
}

/** Attach a sink (e.g., Sentry). Called at most once per boot for each provider. */
export function attachErrorSink(sink: ErrorSink): () => void {
  sinks.push(sink)
  return () => {
    const i = sinks.indexOf(sink)
    if (i >= 0) sinks.splice(i, 1)
  }
}
