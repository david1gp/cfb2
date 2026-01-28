import { expect, test } from "bun:test"

test("tests_exists_and_are_working", () => {
  const a1 = 1
  const a2 = 1
  const got = a1 + a2
  expect(got).toBe(2)
})
