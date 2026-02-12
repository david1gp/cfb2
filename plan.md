## user story

I want a well thought out plan for
/home/david/Coding/adaptive-cf-b2
​
I want to be able to
- configure custom domains for backblaze b2 bucket file downloads
- have an `/upload` endpoint, that the browser client can use to upload files through the cloudflare worker
- have an `/upload-path` that returns a signed url that the browser client can then use to upload a file directly to b2 without the worker
​
Documentation
- s3mini library with readme docs - `/home/david/Coding/adaptive-cf-b2/docs/s3mini.md`
- s3mini example code - `/home/david/Coding/adaptive-cf-b2/docs/s3mini_example.js`
- cloudflare skill for cldouflare documentation
- context7 mcp tool to look up documentation
- use websearch using minimax skill
  for native b2 api if needed
  https://www.backblaze.com/apidocs/introduction-to-the-b2-native-api
​
Tests
- upload file, test if it exists
- get upload url, test file upload, test if it exists and can be downloaded
- write test for listing, download of files through the s3mini library
- write tests to get signed url and test upload through s3mini library 
- ~~check cors headers are set~~
- write download requests using plain `fetch`

Acceptance criteria
- changes are deployed to cloudflare using `bun run deploy`
- `bun run tsc` passes
- tests written
- `bun test` passing 

Additional
- credetials should be loaded from .env file, keys: `​PEER_ACCOUNT`, `PEER_KEY`
- always use `bun` instead of `npm`/`pnpm`
- Import aliases:
  `utils` -> `node_modules/@adaptive-ds/utils/`
- use `Result` type from `~utils/result/Result` to model return valules that can fail, like fetch calls
- validate all `fetch` return values and requests` with valibot
- use `wrangler.jsonc` to allow configuring multiple domains

## Questions for Clarification

Signed URL expiration: Should /upload-path accept an expiresIn parameter? What's a reasonable default (e.g., 1 hour, 24 hours)?

-> configured in wrangler.jsonc env (for each domain separately) UPLOAD_URL_EXPIRATION_MS in ms, default = 24h

Upload size limits: Should we enforce a maximum file size for /upload endpoint? What's the limit?

-> configured in wrangler.jsonc env (for each domain separately)  UPLOAD_MAX_FILE_SIZE_MB, default none

Key generation: Should /upload auto-generate keys (e.g., UUID) or require the client to specify them?

-> client specifies them

Content-Type detection: Should we auto-detect content-type from file extension or require explicit specification?

-> client specifies them, including sha

Cache settings: The bucket has cache-control: public, max-age=86400, stale-while-revalidate=259200, immutable - should uploads respect this or allow override?

-> should be configurable in wrangler.jsonc env (for each domain separately) HEADER_CACHE_CONTROL


## valibot parsing example

```
import { parseJson, pipe, safeParse, string } from "valibot"
const schema = pipe(string(), parseJson(), taskSchema)
const parsing = safeParse(schema, stdout)
```

## b2 bucket credentials

Bucket ID: 
5397d8f6b7ba500797b1041f

bucket settings:
{"cache-control":"public, max-age=86400, stale-while-revalidate=259200, immutable"}

Endpoint:
s3.eu-central-003.backblazeb2.com

keyID:
00337867a07714f0000000018

keyName:
K003rthVc/HSnAStHX7RQO3G+v5gxcE

## example file

Name:home/2025-12-25_screenshot.jpg

Bucket Name:peer-astro-media

Bucket Type:Public

Friendly URL:https://f003.backblazeb2.com/file/peer-astro-media/home/2025-12-25_screenshot.jpg

S3 URL:https://peer-astro-media.s3.eu-central-003.backblazeb2.com/home/2025-12-25_screenshot.jpg

Native URL:https://f003.backblazeb2.com/b2api/v1/b2_download_file_by_id?fileId=4_z5397d8f6b7ba500797b1041f_f1113cd7d5a297aac_d20251225_m015514_c003_v0312034_t0033_u01766627714079

Kind:image/jpeg

Size:55.7 KB

Uploaded:12/25/2025 07:55

File ID:4_z5397d8f6b7ba500797b1041f_f1113cd7d5a297aac_d20251225_m015514_c003_v0312034_t0033_u01766627714079

Sha1:fd594195bfb2c0538900d5270640bdc912ed38f1

File Info:src_last_modified_millis: 1766627500505   (12/25/2025 07:51)
