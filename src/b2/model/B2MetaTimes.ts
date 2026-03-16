import { dateTimeSchema } from "@adaptive-ds/utils/valibot/dateTimeSchema.js"

export type B2MetaTimes = {
  createdAt: string
  expiresAt: string
}

export const b2MetaSchemaFields = {
  createdAt: dateTimeSchema,
  expiresAt: dateTimeSchema,
} as const
