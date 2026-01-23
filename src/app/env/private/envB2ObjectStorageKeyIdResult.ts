import { envVariableErrorMessage } from "@/app/env/envVariableErrorMessage"
import { privateEnvVariableName } from "@/app/env/privateEnvVariableName"
import { createResult, createResultError, type Result } from "~utils/result/Result"

export function envB2ObjectStorageKeyIdResult(): Result<string> {
  const op = "envB2ObjectStorageKeyIdResult"
  const name = privateEnvVariableName.B2_OBJECT_STORAGE_KEY_ID
  const value = process.env.B2_OBJECT_STORAGE_KEY_ID
  if (!value) {
    const errorMessage = envVariableErrorMessage(name)
    return createResultError(op, errorMessage)
  }
  return createResult(value)
}
