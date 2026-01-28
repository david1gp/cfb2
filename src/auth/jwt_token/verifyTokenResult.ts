import type { DecodedToken } from "@/auth/jwt_token/DecodedToken"
import { verifyToken } from "@/auth/jwt_token/verifyToken"
import { envTokenSecretResult } from "@/env/envTokenSecretResult"
import type { PromiseResult } from "~utils/result/Result"

export async function verifyTokenResult(token: string): PromiseResult<DecodedToken> {
  // env variable
  const secretSalt = envTokenSecretResult()
  if (!secretSalt.success) return secretSalt
  const salt = secretSalt.data
  // token
  return verifyToken(token, salt)
}
