import { type B2MetaTimes, b2MetaSchemaFields } from "@/b2/model/B2MetaTimes"
import * as a from "valibot"

export interface B2UrlModel extends B2MetaTimes {
  uploadUrl: string
  authorizationToken: string
}

export const b2UrlSchema = a.object({
  uploadUrl: a.string(),
  authorizationToken: a.string(),
  ...b2MetaSchemaFields,
})

function types1(d: a.InferOutput<typeof b2UrlSchema>): B2UrlModel {
  return d
}

function types2(d: B2UrlModel): a.InferOutput<typeof b2UrlSchema> {
  return d
}
