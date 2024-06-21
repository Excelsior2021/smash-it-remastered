import { expect, test } from "vitest"
import { validateUsername, verifyPassword } from "@/src/lib/server-validation"
import { compare } from "bcryptjs"
import pattern from "@/src/lib/field-validation"
import obscenity from "@/src/lib/obscenity-matcher"
import prisma from "@/src/lib/prisma"

test("verifyPassowrd function", async () => {
  expect(
    await verifyPassword(
      "test123",
      "$2a$12$CIVjMPD3AQsuMwTzTRB9PecfciHDFRx1B1vNSf0m9iEQWHRFHE3DO",
      compare
    )
  ).toBeTruthy()
})

test("validateUsername function", async () => {
  expect(
    await validateUsername("excelsior", pattern, obscenity, prisma)
  ).toBeTruthy()
  console.log(await validateUsername("excelsior", pattern, obscenity, prisma))
})
