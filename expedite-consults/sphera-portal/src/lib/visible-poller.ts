/**
 * Polling helper that is gentle on the server:
 *  - pauses completely while the browser tab is hidden (and refreshes once when it becomes visible again)
 *  - exponential backoff after failures (base -> 2x -> 4x ... capped at `maxMs`), reset on the next success
 *  - never runs two requests at once
 *
 * `task` should resolve to `false` (or throw) to signal a failed poll; anything else counts as success.
 * Returns a `stop()` function.
 */
export interface VisiblePollerOptions {
  /** Delay between successful polls. Default 6s. */
  baseMs?: number
  /** Upper bound for the backoff delay. Default 60s. */
  maxMs?: number
  /** Run the first poll immediately. Default false (callers usually fetch once themselves). */
  immediate?: boolean
}

export function startVisiblePoller(
  task: () => Promise<boolean | void>,
  { baseMs = 6000, maxMs = 60000, immediate = false }: VisiblePollerOptions = {}
): () => void {
  if (typeof window === "undefined") return () => {}

  let stopped = false
  let running = false
  let failures = 0
  let timer: ReturnType<typeof setTimeout> | null = null

  const nextDelay = () => Math.min(maxMs, baseMs * Math.pow(2, failures))

  const clear = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  const schedule = (delay: number) => {
    clear()
    if (stopped || document.visibilityState === "hidden") return
    timer = setTimeout(run, delay)
  }

  const run = async () => {
    if (stopped || running) return
    if (document.visibilityState === "hidden") return
    running = true
    try {
      const result = await task()
      failures = result === false ? Math.min(failures + 1, 10) : 0
    } catch {
      failures = Math.min(failures + 1, 10)
    } finally {
      running = false
    }
    schedule(nextDelay())
  }

  const onVisibility = () => {
    if (stopped) return
    if (document.visibilityState === "visible") {
      // Resume right away, then continue on the normal cadence
      clear()
      void run()
    } else {
      clear()
    }
  }

  document.addEventListener("visibilitychange", onVisibility)
  if (immediate) void run()
  else schedule(baseMs)

  return () => {
    stopped = true
    clear()
    document.removeEventListener("visibilitychange", onVisibility)
  }
}
