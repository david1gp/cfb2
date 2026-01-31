import type { Env } from "@/env/Env"
import { envVariableErrorMessage } from "@/env/envVariableErrorMessage"
import { privateEnvVariableName } from "@/env/privateEnvVariableName"
import { createResult, createResultError, type Result } from "~utils/result/Result"

export function envKVResult(env: Env): Result<Env["KV"]> {
  const op = "envKVResult"
  const name = privateEnvVariableName.KV
  const value = env.KV
  if (!value) {
    const errorMessage = envVariableErrorMessage(name)
    return createResultError(op, errorMessage)
  }
  return createResult(value)
}
