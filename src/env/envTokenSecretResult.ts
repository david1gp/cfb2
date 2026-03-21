import type { Env } from "./Env.js"
import { envVariableErrorMessage } from "./envVariableErrorMessage.js"
import { privateEnvVariableName } from "./privateEnvVariableName.js"
import { createResult, createResultError, type Result } from "@adaptive-ds/result"

export function envTokenSecretResult(env: Env): Result<string> {
  const op = "envTokenSecretResult"
  const name = privateEnvVariableName.TOKEN_SECRET
  const value = env.TOKEN_SECRET
  if (!value) {
    const errorMessage = envVariableErrorMessage(name)
    return createResultError(op, errorMessage)
  }
  return createResult(value)
}
