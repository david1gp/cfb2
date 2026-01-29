import type { Env } from "@/env/Env"
import type { Context } from "hono"

export type HonoContext = Context<{ Bindings: Env }>
