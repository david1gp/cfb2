export type PrivateEnvVariableName = keyof typeof privateEnvVariableName

export const privateEnvVariableName = {
  B2_ACCOUNT: "B2_ACCOUNT",
  B2_KEY: "B2_KEY",
} as const
