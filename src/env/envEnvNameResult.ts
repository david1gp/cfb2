import type { Env } from "./Env"
import { envVariableErrorMessage } from "./envVariableErrorMessage"
import { privateEnvVariableName } from "./privateEnvVariableName"
import { createResult, createResultError, type Result } from "@adaptive-ds/result"

export function envEnvNameResult(env: Env): Result<string> {
  const op = "envEnvNameResult"
  const name = privateEnvVariableName.ENV_NAME
  const value = env.ENV_NAME
  if (!value) {
    const errorMessage = envVariableErrorMessage(name)
    return createResultError(op, errorMessage)
  }
  return createResult(value)
}
