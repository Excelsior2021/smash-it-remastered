import { expect, test, it, describe } from "vitest"
import { mockFn } from "vitest-mock-extended"
import {
  getAdminCount,
  isAdmin,
  isMaxGroupMembers,
  isMaxUserGroups,
  userInGroup,
  validateEmail,
  validateGroupName,
  validateName,
  validatePassword,
  validateScores,
  validateUsername,
  verifyPassword,
} from "@/src/lib/server-validation"
import { compare } from "bcryptjs"
import pattern from "./__mocks__/field-validation"
import obscenity from "./__mocks__/obscenity-matcher"
import prisma from "./__mocks__/prisma"

describe("lib/server-validation", () => {
  const userId = 1
  const groupId = 1
  describe("verifyPassword()", () => {
    it("returns true", async () => {
      expect(
        await verifyPassword(
          "test123",
          "$2a$12$CIVjMPD3AQsuMwTzTRB9PecfciHDFRx1B1vNSf0m9iEQWHRFHE3DO",
          compare
        )
      ).toBeTruthy()
    })

    it("returns false", async () => {
      expect(await verifyPassword("test123", "test123", compare)).toBeFalsy()
    })
  })

  describe("validateUsername()", async () => {
    const username = "testUser"
    pattern.username.test = mockFn()

    test("username already exists", async () => {
      prisma.user.findUnique.mockResolvedValue({ username })

      const validateUsernameReturnValue = await validateUsername(
        username,
        pattern,
        obscenity,
        prisma
      )

      expect(validateUsernameReturnValue).toStrictEqual({
        usernameAlreadyExists: { username },
        usernamePattern: true,
      })
    })

    test("username obscene", async () => {
      prisma.user.findUnique.mockResolvedValue(null)
      obscenity.hasMatch.mockReturnValueOnce(true)

      pattern.username.test.mockReturnValue(true)

      const validateUsernameReturnValue = await validateUsername(
        username,
        pattern,
        obscenity,
        prisma
      )

      expect(validateUsernameReturnValue).toStrictEqual({
        usernameObscene: true,
        usernamePattern: true,
      })
    })

    test("username invalid", async () => {
      prisma.user.findUnique.mockResolvedValue(null)
      obscenity.hasMatch.mockReturnValueOnce(false)
      pattern.username.test.mockReturnValueOnce(false)

      const validateUsernameReturnValue = await validateUsername(
        username,
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

  describe("validateGroupName()", () => {
    const groupName = "testGroup"
    pattern.groupName.test = mockFn()

    test("group name already exists", async () => {
      prisma.group.findUnique.mockResolvedValue({ groupName })

      const validateGroupNameReturnValue = await validateGroupName(
        groupName,
        pattern,
        obscenity,
        prisma
      )

      expect(validateGroupNameReturnValue).toStrictEqual({
        groupNameAlreadyExists: { groupName },
        groupNamePattern: true,
      })
    })

    test("group name obscene", async () => {
      prisma.group.findUnique.mockResolvedValue(null)
      obscenity.hasMatch.mockReturnValueOnce(true)

      pattern.groupName.test.mockReturnValue(true)

      const validateGroupNameReturnValue = await validateGroupName(
        groupName,
        pattern,
        obscenity,
        prisma
      )

      expect(validateGroupNameReturnValue).toStrictEqual({
        groupNameObscene: true,
        groupNamePattern: true,
      })
    })

    test("group name invalid", async () => {
      prisma.group.findUnique.mockResolvedValue(null)
      obscenity.hasMatch.mockReturnValueOnce(false)
      pattern.groupName.test.mockReturnValueOnce(false)

      const validateGroupNameReturnValue = await validateGroupName(
        groupName,
        pattern,
        obscenity,
        prisma
      )

      expect(validateGroupNameReturnValue).toStrictEqual({
        groupNameObscene: false,
        groupNamePattern: false,
      })
    })
  })

  describe("validateEmail()", async () => {
    const email = "test@test.com"
    pattern.email.test = mockFn()

    test("email already exists", async () => {
      prisma.user.findUnique.mockResolvedValue({ email })

      const validateEmailReturnValue = await validateEmail(
        email,
        pattern,
        prisma
      )

      expect(validateEmailReturnValue).toStrictEqual({
        emailAlreadyExists: { email },
        emailPattern: true,
      })
    })

    test("email invalid", async () => {
      prisma.user.findUnique.mockResolvedValue(null)
      pattern.email.test.mockReturnValue(false)

      const validateEmailReturnValue = await validateEmail("", pattern, prisma)

      expect(validateEmailReturnValue).toStrictEqual({
        emailPattern: false,
      })
    })
  })

  describe("validateName()", () => {
    const name = "john"
    pattern.name.test = mockFn()

    test("name obscene", () => {
      obscenity.hasMatch.mockReturnValueOnce(true)
      pattern.name.test.mockReturnValueOnce(true)
      expect(validateName(name, pattern, obscenity)).toStrictEqual({
        nameObscene: true,
        namePattern: true,
      })
    })

    test("name invalid", () => {
      pattern.name.test.mockReturnValueOnce(false)
      obscenity.hasMatch.mockReturnValueOnce(false)

      expect(validateName(name, pattern, obscenity)).toStrictEqual({
        nameObscene: false,
        namePattern: false,
      })
    })
  })

  describe("validatePassword()", () => {
    pattern.password.test = mockFn()
    const password = "password"
    const confirmPassword = "password"

    test("passwords match", () => {
      pattern.password.test.mockReturnValueOnce(true)
      expect(
        validatePassword(password, confirmPassword, pattern)
      ).toStrictEqual({ passwordMatch: true, passwordPattern: true })
    })

    test("password invalid", () => {
      pattern.password.test.mockReturnValueOnce(false)
      expect(
        validatePassword(password, confirmPassword, pattern)
      ).toStrictEqual({ passwordMatch: true, passwordPattern: false })
    })
  })

  describe("validateScores()", () => {
    test("both scores are 11 returns false", () => {
      const score1 = 11
      const score2 = 11
      expect(validateScores(score1, score2)).toBe(false)
    })

    test("invalid score returns false", () => {
      let score1 = -1
      let score2 = 0

      expect(validateScores(score1, score2)).toBe(false)

      score1 = 15
      expect(validateScores(score1, score2)).toBe(false)

      score1 = 0
      score2 = -1
      expect(validateScores(score1, score2)).toBe(false)

      score2 = 15
      expect(validateScores(score1, score2)).toBe(false)
    })

    test("valid scores return true", () => {
      const score1 = 11
      const score2 = 9

      expect(validateScores(score1, score2)).toBe(true)
    })
  })

  describe("userInGroup()", () => {
    it("returns a stat obj", async () => {
      const statObj = {
        userId,
        groupId,
      }

      prisma.stat.findUnique.mockResolvedValue(statObj)

      expect(await userInGroup(userId, groupId, prisma)).toStrictEqual(statObj)
    })
  })

  describe("isAdmin()", () => {
    it("returns true", async () => {
      prisma.stat.findUnique.mockResolvedValue({ isAdmin: true })
      expect(await isAdmin(prisma, userId, groupId)).toBe(true)
    })

    it("returns false", async () => {
      prisma.stat.findUnique.mockResolvedValue(null)
      expect(await isAdmin(prisma, userId, groupId)).toBe(false)
    })
  })

  describe("isMaxGroupMembers()", () => {
    it("returns true", async () => {
      prisma.group.findUnique.mockResolvedValueOnce({
        _count: {
          stats: 20,
        },
      })
      expect(await isMaxGroupMembers(groupId, prisma)).toBe(true)
    })

    it("returns false", async () => {
      prisma.group.findUnique.mockResolvedValueOnce(null)
      expect(await isMaxGroupMembers(groupId, prisma)).toBe(false)
    })
  })

  describe("isMaxUserGroups()", () => {
    it("returns true", async () => {
      prisma.user.findUnique.mockResolvedValueOnce({
        _count: {
          stats: 3,
        },
      })
      expect(await isMaxUserGroups(userId, prisma)).toBe(true)
    })

    it("returns false", async () => {
      prisma.user.findUnique.mockResolvedValueOnce(null)
      expect(await isMaxUserGroups(userId, prisma)).toBe(false)
    })
  })

  describe("getAdminCount()", () => {
    it("returns admin count", async () => {
      prisma.group.findUnique.mockResolvedValueOnce({ _count: { stats: 3 } })

      expect(await getAdminCount(groupId, prisma)).toBe(3)
    })
  })
})
