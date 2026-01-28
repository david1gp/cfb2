import { envVariableErrorMessage } from "@/env/envVariableErrorMessage"
import { privateEnvVariableName } from "@/env/privateEnvVariableName"
import { createResult, createResultError, type Result } from "~utils/result/Result"

export function envB2KeyResult(env: Record<string, string | undefined> = process.env): Result<string> {
  const op = "envB2KeyResult"
  const name = privateEnvVariableName.B2_KEY
  const value = env.B2_KEY
  if (!value) {
    const errorMessage = envVariableErrorMessage(name)
    return createResultError(op, errorMessage)
  }
  return createResult(value)
}
