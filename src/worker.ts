import { handle } from "@astrojs/cloudflare/handler";
import { ensureCalendarWatch } from "./lib/google/calendar-watch";
import type { ApiEnv } from "./lib/api";

type WorkerEnv = ApiEnv & {
  ASSETS: Fetcher;
  SESSION?: KVNamespace;
};

export default {
  async fetch(request: Request, env: WorkerEnv, ctx: ExecutionContext) {
    return handle(request, env, ctx);
  },
  async scheduled(_controller: ScheduledController, env: WorkerEnv, ctx: ExecutionContext) {
    ctx.waitUntil(ensureCalendarWatch(env));
  },
} satisfies ExportedHandler<WorkerEnv>;
