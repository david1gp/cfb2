import * as a from "valibot"
import { intSchemaMin0 } from "~utils/valibot/intSchema"

export type DecodedToken = {
  // subject, whom the token refers to
  sub: string
  // issued at, seconds since unix epoch
  iat: number
  // expires, seconds since unix epoch
  exp: number
}

export const decodedTokenSchema = a.object({
  sub: a.string(),
  iat: intSchemaMin0,
  exp: intSchemaMin0,
})

function types1(d: a.InferOutput<typeof decodedTokenSchema>): DecodedToken {
  return { ...d }
}

function types2(d: DecodedToken): a.InferOutput<typeof decodedTokenSchema> {
  return { ...d }
}
