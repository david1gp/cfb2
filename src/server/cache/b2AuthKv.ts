import { b2ApiAuthorizeAccount } from "@/b2/api/b2ApiAuthorizeAccount"
import { b2AuthSchema, type B2AuthModel } from "@/b2/model/B2AuthModel"
import { enableLogging } from "@/config/enableLogging"
import type { Env } from "@/env/Env"
import { envB2KeyIdResult } from "@/env/envB2AccountResult"
import { envB2KeyResult } from "@/env/envB2KeyResult"
import { envEnvNameResult } from "@/env/envEnvNameResult"
import dayjs from "dayjs"
import * as a from "valibot"
import { createResult, type PromiseResult } from "~utils/result/Result"

export async function b2AuthKvGetAndSave(env: Env): PromiseResult<B2AuthModel> {
  const op = "b2AuthKvGetAndSave"
  if (enableLogging) console.log(">>>", op, "START")

  const envNameResult = envEnvNameResult(env)
  if (enableLogging) console.log(op, "envNameResult success:", envNameResult.success)
  if (!envNameResult.success) {
    console.error(op, "error getting envName:", envNameResult.errorMessage)
    return envNameResult
  }
  const envName = envNameResult.data

  if (enableLogging) console.log(op, "Loading cached auth...")
  const cachedAuth = await b2AuthKvLoad(env, envName)
  if (cachedAuth) {
    if (enableLogging) console.log(op, "Using cached auth")
    return createResult(cachedAuth)
  }
  if (enableLogging) console.log(op, "No cached auth, authorizing...")

  const accountResult = envB2KeyIdResult(env)
  if (enableLogging) console.log(op, "accountResult success:", accountResult.success)
  if (!accountResult.success) {
    console.error(op, "error getting account:", accountResult.errorMessage)
    return accountResult
  }

  const keyResult = envB2KeyResult(env)
  if (enableLogging) console.log(op, "keyResult success:", keyResult.success)
  if (!keyResult.success) {
    console.error(op, "error getting key:", keyResult.errorMessage)
    return keyResult
  }

  if (enableLogging) console.log(op, "Calling B2 API to authorize...")
  const authResult = await b2ApiAuthorizeAccount(accountResult.data, keyResult.data)
  if (enableLogging) console.log(op, "authResult success:", authResult.success)
  if (!authResult.success) {
    console.error(op, "error from B2 API:", authResult.errorMessage)
    return authResult
  }
  await b2AuthKvSave(env, envName, authResult.data)
  if (enableLogging) console.log(op, "Auth saved, SUCCESS")
  return createResult(authResult.data)
}

async function b2AuthKvLoad(env: Env, envName: string): Promise<B2AuthModel | null> {
  const key = createB2AuthKey(envName)
  const value = await env.cfb2.get(key)
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
  await env.cfb2.put(createB2AuthKey(envName), JSON.stringify(auth), {
    expirationTtl: hours23inSeconds,
  })
}

function createB2AuthKey(envName: string): string {
  return `b2_auth_${envName}`
}
