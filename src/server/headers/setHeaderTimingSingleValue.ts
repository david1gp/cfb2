import { type ServerTimingValues, setHeaderTiming } from "./setHeaderTiming"

export function setHeaderTimingSingleValue(
  r: Response,
  op: string,
  startedAt: number,
  endedAt: number = Date.now(),
): Response {
  const values: ServerTimingValues[] = [{ name: op, amount: Math.trunc(endedAt - startedAt) }]
  setHeaderTiming(r, values)
  return r
}
