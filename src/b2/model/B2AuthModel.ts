import { type B2MetaTimes, b2MetaSchemaFields } from "@/b2/model/B2MetaTimes"
import * as a from "valibot"

export interface B2AuthModel extends B2MetaTimes {
  apiUrl: string
  bucketId: string
  authorizationToken: string
}

export const b2AuthSchema = a.object({
  apiUrl: a.string(),
  bucketId: a.string(),
  authorizationToken: a.string(),
  ...b2MetaSchemaFields,
})

function types1(d: a.InferOutput<typeof b2AuthSchema>): B2AuthModel {
  return d
}

function types2(d: B2AuthModel): a.InferOutput<typeof b2AuthSchema> {
  return d
}
