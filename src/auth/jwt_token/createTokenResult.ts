import { createToken } from "@/auth/jwt_token/createToken"
import { tokenValidDurationInDays } from "@/auth/jwt_token/tokenValidDurationInDays"
import { envTokenSecretResult } from "@/env/envTokenSecretResult"
import { createError, createResult, type PromiseResult } from "~utils/result/Result"

export async function createTokenResult(userId: string): PromiseResult<string> {
  const expiresInDays = tokenValidDurationInDays
  const op = "createTokenResult"
  console.log(op, userId)
  // env variable
  const saltResult = envTokenSecretResult()
  if (!saltResult.success) return saltResult
  const salt = saltResult.data
  // token
  const payload: Record<string, string> = {}
  const token = await createToken(userId, salt, payload, expiresInDays)
  if (!token) return createError(op, "empty salt")
  return createResult(token)
}
