import { createToken } from "./createToken.js"
import { tokenValidDurationInDays } from "./tokenValidDurationInDays.js"
import { enableLogging } from "../../config/enableLogging.js"
import { envTokenSecretResult } from "../../env/envTokenSecretResult.js"
import type { Env } from "../../env/Env.js"
import { createError, createResult, type PromiseResult } from "@adaptive-ds/result"

export async function createTokenResult(userId: string, env: Env): PromiseResult<string> {
  const expiresInDays = tokenValidDurationInDays
  const op = "createTokenResult"
  if (enableLogging) console.log(op, userId)
  const saltResult = envTokenSecretResult(env)
  if (!saltResult.success) return saltResult
  const salt = saltResult.data
  const payload: Record<string, string> = {}
  const token = await createToken(userId, salt, payload, expiresInDays)
  if (!token) return createError(op, "empty salt")
  return createResult(token)
}
