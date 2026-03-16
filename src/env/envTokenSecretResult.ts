import type { Env } from "./Env"
import { envVariableErrorMessage } from "./envVariableErrorMessage"
import { privateEnvVariableName } from "./privateEnvVariableName"
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
