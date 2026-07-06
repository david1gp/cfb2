import type { Result } from "@adaptive-ds/result"
import dayjs from "dayjs"
import { enableLogging } from "../../config/enableLogging.js"

export function b2RefreshNeeded<T extends { expiresAt: string }>(cached: Result<T>) {
  const op = "b2RefreshNeeded"
  if (!cached.success) return true
  const expiresAt = dayjs(cached.data.expiresAt)
  const isBeforeNow = expiresAt.isBefore(dayjs())
  if (enableLogging) console.log(op, { expiresAt, isBeforeNow })
  return isBeforeNow
}
