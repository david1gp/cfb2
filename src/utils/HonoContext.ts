import type { Env } from "../env/Env.js"
import type { Context } from "hono"

export type HonoContext = Context<{ Bindings: Env }>
