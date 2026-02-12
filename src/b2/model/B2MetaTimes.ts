import { dateTimeSchema } from "~utils/valibot/dateTimeSchema"

export type B2MetaTimes = {
  createdAt: string
  expiresAt: string
}

export const b2MetaSchemaFields = {
  createdAt: dateTimeSchema,
  expiresAt: dateTimeSchema,
} as const
