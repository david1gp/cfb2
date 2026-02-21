import type { B2AuthModel } from "@/b2/model/B2AuthModel"
import { enableLogging } from "@/config/enableLogging"
import dayjs from "dayjs"
import * as a from "valibot"
import { createError, createResult, createResultError, type PromiseResult } from "~utils/result/Result"
import { intSchema, intSchemaMin0 } from "~utils/valibot/intSchema"

const b2ApiFields = {
  absoluteMinimumPartSize: intSchema,
  accountId: a.string(),
  allowed: a.object({
    bucketId: a.string(),
    bucketName: a.string(),
    namePrefix: a.nullable(a.string()),
  }),
  apiUrl: a.string(),
  authorizationToken: a.string(),
  downloadUrl: a.string(),
  recommendedPartSize: intSchema,
  s3ApiUrl: a.string(),
} as const

export const b2ApiAuthSchema = a.object(b2ApiFields)

export const b2ApiErrSchema = a.object({
  code: a.string(),
  message: a.string(),
  status: intSchemaMin0,
})

const log = true

/**
 * api reference - https://www.backblaze.com/apidocs/b2-authorize-account
 */
export async function b2ApiAuthorizeAccount(keyId: string, applicationKey: string): PromiseResult<B2AuthModel> {
  const op = "b2ApiAuthorizeAccount"
  if (enableLogging) console.log(">>>", op, "START")
  if (enableLogging) console.log(op, "keyId:", keyId)
  const credentials = "Basic " + btoa(`${keyId}:${applicationKey}`)
  // "Basic " + Buffer.from(keyId + ":" + applicationKey).toString("base64"),
  const authResponse = await fetch("https://api.backblazeb2.com/b2api/v2/b2_authorize_account", {
    headers: {
      Authorization: credentials,
    },
  })
  const fetched = await authResponse.text()
  if (enableLogging) console.log(op, "response status:", authResponse.status, authResponse.statusText)
  if (enableLogging) console.log(op, "response:", fetched)

  if (!authResponse.ok) {
    // return createError(op, "api error", fetched)
    const schema = a.pipe(a.string(), a.parseJson(), b2ApiErrSchema)
    const parse = a.safeParse(schema, fetched)
    if (!parse.success) {
      console.error(op, "error parsing error response:", fetched)
      return createError(op, "api error", fetched)
    }
    console.error(op, "B2 API error:", parse.output.code, parse.output.message)
    return createError(op, parse.output.code, fetched)
  }

  const schema = a.pipe(a.string(), a.parseJson(), b2ApiAuthSchema)
  const parsing = a.safeParse(schema, fetched)
  if (enableLogging) console.log(op, "parsed:", parsing)
  if (!parsing.success) {
    console.error(op, "parse error:", a.summarize(parsing.issues))
    return createResultError(op, a.summarize(parsing.issues), fetched)
  }
  const data = parsing.output
  // meta dates
  const now = dayjs()
  const expires = now.add(23, "hours").add(55, "minutes")
  const createdAt = now.toISOString()
  const expiresAt = expires.toISOString()
  // result
  const auth: B2AuthModel = {
    apiUrl: data.apiUrl,
    authorizationToken: data.authorizationToken,
    bucketId: data.allowed.bucketId,
    accountId: data.accountId,
    createdAt,
    expiresAt,
  }
  if (enableLogging) console.log(op, "SUCCESS")
  return createResult(auth)
}
