import { createResult, createResultError, type Result } from "@adaptive-ds/result"
import type { Env } from "./Env.js"
import { envVariableErrorMessage } from "./envVariableErrorMessage.js"
import { privateEnvVariableName } from "./privateEnvVariableName.js"

export function envVersionResult(env: Env): Result<string> {
  const op = "envVersionResult"
  const name = privateEnvVariableName.VERSION
  const value = env.VERSION
  if (!value) {
    const errorMessage = envVariableErrorMessage(name)
    return createResultError(op, errorMessage)
  }
  return createResult(value)
}
