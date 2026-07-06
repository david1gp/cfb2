import type { Hono } from "hono"
import type { BlankSchema } from "hono/types"
import type { Env } from "../env/Env.js"

export type HonoApp = Hono<
  {
    Bindings: Env
  },
  BlankSchema,
  "/"
>
