export async function calculateSHA1(data: string | object): Promise<string> {
  const encoder = new TextEncoder()
  let dataBytes: Uint8Array

  if (typeof data === "string") {
    dataBytes = encoder.encode(data)
  } else {
    dataBytes = encoder.encode(JSON.stringify(data))
  }

  const hashBuffer = await crypto.subtle.digest("SHA-1", dataBytes as any)
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

export async function calculateSHA1FromBlob(blob: Blob): Promise<string> {
  const arrayBuffer = await blob.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest("SHA-1", arrayBuffer as any)
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

export async function calculateSHA1FromUint8Array(uint8Array: Uint8Array): Promise<string> {
  const hashBuffer = await crypto.subtle.digest("SHA-1", uint8Array as any)
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

export async function calculateSHA1FromReadableStream(stream: ReadableStream): Promise<{ sha1: string; uint8Array: Uint8Array }> {
  const reader = stream.getReader()
  const chunks: Uint8Array[] = []
  let totalLength = 0

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
      totalLength += value.length
    }

    const uint8Array = new Uint8Array(totalLength)
    let offset = 0
    for (const chunk of chunks) {
      uint8Array.set(chunk, offset)
      offset += chunk.length
    }

    const sha1 = await calculateSHA1FromUint8Array(uint8Array)
    return { sha1, uint8Array }
  } finally {
    reader.releaseLock()
  }
}
