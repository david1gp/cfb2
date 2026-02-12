import { decodedTokenSchema, type DecodedToken } from "@/auth/jwt_token/DecodedToken"
import { jwtVerify } from "jose"
import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "~utils/result/Result"

export async function verifyToken(token: string, secret: string | undefined): PromiseResult<DecodedToken> {
  const op = "verifyToken"
  if (!secret) return createResultError(op, "missing secret")
  try {
    const encodedSecret = new TextEncoder().encode(secret)
    const verified = await jwtVerify(token, encodedSecret)
    const decoded = a.parse(decodedTokenSchema, verified.payload)
    return createResult(decoded)
  } catch (e: any) {
    return createResultError(op, e.message)
  }
}
