import { enableLogging } from "@/config/enableLogging"
import dayjs from "dayjs"
import type { Result } from "~utils/result/Result"

export function b2RefreshNeeded<T extends { expiresAt: string }>(cached: Result<T>) {
  const op = "b2RefreshNeeded"
  if (!cached.success) return true
  const expiresAt = dayjs(cached.data.expiresAt)
  const isBeforeNow = expiresAt.isBefore(dayjs())
  if (enableLogging) console.log(op, { expiresAt, isBeforeNow })
  return isBeforeNow
}
