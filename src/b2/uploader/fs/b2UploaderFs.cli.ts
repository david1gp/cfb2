import { b2ApiUploadContent, type B2ApiUploadContentProps } from "@/b2/api/b2ApiUploadContent"
import { b2UploaderFs } from "@/b2/uploader/fs/b2UploaderFs"
import { calculateSHA1 } from "@/utils/sha1"
import { getMimeType, mimeTypes } from "~utils/file/getMimeType"

const b2r = await b2UploaderFs()
if (!b2r.success) {
  console.error("!init", b2r)
  process.exit(1)
}
const b2 = b2r.data
const fileName = "hello.txt"
const fileContent = "hello"
const mime: string = getMimeType(fileName) ?? mimeTypes.txt

const contentLength = fileContent.length
const sha1 = await calculateSHA1(fileContent)
const props: B2ApiUploadContentProps = { fullFileName: fileName, mimeType: mime, contentLength, sha1 }

const uploaded = await b2(props, fileContent)
console.log(uploaded)
