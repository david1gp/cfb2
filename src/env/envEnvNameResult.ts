import { envVariableErrorMessage } from "@/env/envVariableErrorMessage"
import { privateEnvVariableName } from "@/env/privateEnvVariableName"
import { createResult, createResultError, type Result } from "~utils/result/Result"

export function envEnvNameResult(env: Record<string, string | undefined> = process.env): Result<string> {
  const op = "envEnvNameResult"
  const name = privateEnvVariableName.ENV_NAME
  const value = env.ENV_NAME
  if (!value) {
    const errorMessage = envVariableErrorMessage(name)
    return createResultError(op, errorMessage)
  }
  return createResult(value)
}
