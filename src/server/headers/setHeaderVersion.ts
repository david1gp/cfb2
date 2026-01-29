export function setHeaderVersion(r: Response, version: string): Response {
  r.headers.set("version", version)
  return r
}
