import { b2ApiAuthorizeAccount } from "@/b2/api/b2ApiAuthorizeAccount"
import { b2AuthSchema, type B2AuthModel } from "@/b2/model/B2AuthModel"
import type { Env } from "@/env/Env"
import { envB2AccountResult } from "@/env/envB2AccountResult"
import { envB2KeyResult } from "@/env/envB2KeyResult"
import { envEnvNameResult } from "@/env/envEnvNameResult"
import dayjs from "dayjs"
import * as a from "valibot"
import { createResult, type PromiseResult } from "~utils/result/Result"

export async function b2AuthKvGetAndSave(env: Env): PromiseResult<B2AuthModel> {
  const op = "b2AuthKvGetAndSave"

  const envNameResult = envEnvNameResult(env as unknown as Record<string, string>)
  if (!envNameResult.success) return envNameResult
  const envName = envNameResult.data

  const cachedAuth = await b2AuthKvLoad(env, envName)
  if (cachedAuth) return createResult(cachedAuth)

  const accountResult = envB2AccountResult(env as unknown as Record<string, string>)
  if (!accountResult.success) return accountResult

  const keyResult = envB2KeyResult(env as unknown as Record<string, string>)
  if (!keyResult.success) return keyResult

  const authResult = await b2ApiAuthorizeAccount(accountResult.data, keyResult.data)
  if (!authResult.success) {
    return authResult
  }
  await b2AuthKvSave(env, envName, authResult.data)
  return createResult(authResult.data)
}

async function b2AuthKvLoad(env: Env, envName: string): Promise<B2AuthModel | null> {
  const key = createB2AuthKey(envName)
  const value = await env.KV.get(key)
  if (!value) return null

  const schema = a.pipe(a.string(), a.parseJson(), b2AuthSchema)
  const parseResult = a.safeParse(schema, value)
  if (!parseResult.success) return null

  const auth = parseResult.output
  if (dayjs(auth.expiresAt).isBefore(dayjs())) return null

  return auth
}

async function b2AuthKvSave(env: Env, envName: string, auth: B2AuthModel): Promise<void> {
  const hours23inSeconds = 60 * 60 * 23
  await env.KV.put(createB2AuthKey(envName), JSON.stringify(auth), {
    expirationTtl: hours23inSeconds,
  })
}

function createB2AuthKey(envName: string): string {
  return `b2_auth_${envName}`
}
