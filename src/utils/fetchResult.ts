import { pipe, safeParse, string, type BaseSchema, type BaseIssue } from "valibot"
import type { Result } from "~utils/result/Result"
import { createError, createResult } from "~utils/result/Result"

export async function fetchResult<T>(
  op: string,
  schema: BaseSchema<string, unknown, BaseIssue<string>>,
  response: Response,
): Promise<Result<T>> {
  if (!response.ok) {
    const errorData = await response.text().catch(() => null)
    return createError(op, `HTTP ${response.status}: ${response.statusText}`, errorData)
  }

  const textResult = await response.text()
  const parseResult = safeParse(pipe(string(), schema), textResult)

  if (!parseResult.success) {
    const valibotError = parseResult as { success: false; issues: Array<{ message: string }>; output: unknown }
    const errorMessage = valibotError.issues.map((issue) => issue.message).join(", ")
    return createError(op, errorMessage, textResult)
  }

  return createResult(parseResult.output as T)
}
