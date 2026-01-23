import { envVariableErrorMessage } from "@/app/env/envVariableErrorMessage"
import { privateEnvVariableName } from "@/app/env/privateEnvVariableName"
import { createResult, createResultError, type Result } from "~utils/result/Result"

export function envB2ObjectStorageKeyResult(): Result<string> {
  const op = "envB2ObjectStorageKeyResult"
  const name = privateEnvVariableName.B2_OBJECT_STORAGE_KEY
  const value = process.env.B2_OBJECT_STORAGE_KEY
  if (!value) {
    const errorMessage = envVariableErrorMessage(name)
    return createResultError(op, errorMessage)
  }
  return createResult(value)
}
