export type PrivateEnvVariableName = keyof typeof privateEnvVariableName

export const privateEnvVariableName = {
  B2_ACCOUNT: "B2_ACCOUNT",
  B2_KEY: "B2_KEY",
  TOKEN_SECRET: "TOKEN_SECRET",
} as const
