import type { Env } from "../env/Env.js"
import type { Hono } from "hono"
import type { BlankSchema } from "hono/types"

export type HonoApp = Hono<
  {
    Bindings: Env
  },
  BlankSchema,
  "/"
>
