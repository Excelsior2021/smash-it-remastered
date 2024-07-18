import { expect, test, describe, vi, beforeEach } from "vitest"
import { validateUsername, verifyPassword } from "@/src/lib/server-validation"
import { compare } from "bcryptjs"
import pattern from "@/src/lib/field-validation"
import obscenity from "./__mocks__/obscenity-matcher"
import prisma from "./__mocks__/prisma"

vi.mock("@/src/lib/field-validation")

describe("server validation functions", () => {
  describe("verifyPassword function", () => {
    test("verifyPassword returns true", async () => {
      expect(
        await verifyPassword(
          "test123",
          "$2a$12$CIVjMPD3AQsuMwTzTRB9PecfciHDFRx1B1vNSf0m9iEQWHRFHE3DO",
          compare
        )
      ).toBeTruthy()
    })

    test("verifyPassword returns false", async () => {
      expect(await verifyPassword("test123", "test123", compare)).toBeFalsy()
    })
  })

  describe("validateUsername function", async () => {
    let validateUsernameReturnValue = await validateUsername(
      "",
      pattern,
      obscenity,
      prisma
    )

    test("username already exists", async () => {
      prisma.user.findUnique.mockResolvedValue({ username: "testUser" })

      validateUsernameReturnValue = await validateUsername(
        "testUser",
        pattern,
        obscenity,
        prisma
      )

      expect(validateUsernameReturnValue).toStrictEqual({
        usernameAlreadyExists: { username: "testUser" },
        usernamePattern: true,
      })
    })

    test("username obscene", async () => {
      prisma.user.findUnique.mockResolvedValue(null)
      obscenity.hasMatch.mockReturnValue(true)

      validateUsernameReturnValue = await validateUsername(
        "testUser",
        pattern,
        obscenity,
        prisma
      )

      expect(validateUsernameReturnValue).toStrictEqual({
        usernameObscene: true,
        usernamePattern: true,
      })
    })

    test("username pattern invalid", async () => {
      prisma.user.findUnique.mockResolvedValue(null)
      obscenity.hasMatch.mockReturnValue(false)

      validateUsernameReturnValue = await validateUsername(
        "_testUser",
        pattern,
        obscenity,
        prisma
      )

      expect(validateUsernameReturnValue).toStrictEqual({
        usernameObscene: false,
        usernamePattern: false,
      })
    })
  })

  describe("validateEmail", async () => {})
})
