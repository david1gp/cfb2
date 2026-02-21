import { createToken } from "@/auth/jwt_token/createToken"
import { tokenValidDurationInDays } from "@/auth/jwt_token/tokenValidDurationInDays"
import { enableLogging } from "@/config/enableLogging"
import { envTokenSecretResult } from "@/env/envTokenSecretResult"
import type { Env } from "@/env/Env"
import { createError, createResult, type PromiseResult } from "~utils/result/Result"

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
