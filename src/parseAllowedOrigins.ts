
export function parseAllowedOrigins(corsAllowOrigin?: string): string[] {
  if (!corsAllowOrigin) {
    return ["*"]
  }
  return corsAllowOrigin.includes(", ")
    ? corsAllowOrigin.split(", ").map((origin) => origin.trim())
    : [corsAllowOrigin.trim()]
}
