import { envVariableErrorMessage } from "@/env/envVariableErrorMessage"
import { privateEnvVariableName } from "@/env/privateEnvVariableName"
import { createResult, createResultError, type Result } from "~utils/result/Result"

export function envTokenSecretResult(env: Record<string, string | undefined> = process.env): Result<string> {
  const op = "envTokenSecretResult"
  const name = privateEnvVariableName.TOKEN_SECRET
  const value = env.TOKEN_SECRET
  if (!value) {
    const errorMessage = envVariableErrorMessage(name)
    return createResultError(op, errorMessage)
  }
  return createResult(value)
}
