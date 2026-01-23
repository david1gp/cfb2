export type PrivateEnvVariableName = keyof typeof privateEnvVariableName

export const privateEnvVariableName = {
  B2_OBJECT_STORAGE_KEY_ID: "B2_OBJECT_STORAGE_KEY_ID",
  B2_OBJECT_STORAGE_KEY: "B2_OBJECT_STORAGE_KEY",
} as const
