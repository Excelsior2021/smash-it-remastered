import { describe, expect, test, vi, afterEach } from "vitest"
import { generateDisplayName, updateGroupDataForPage } from "@/src/lib/utils"
import type { NextRouter } from "next/router"

describe("lib/utils", () => {
  describe("updateGroupDataForPage", () => {
    const router = vi.fn(() => ({
      replace: (url: string) => {},
    }))
    const activeGroup = {
      id: 1,
      name: "myGroup",
    }
    const url = "mypage.com"

    test("updateGroupDataForPage replaces url", () => {
      const routerGroupId = "2"
      updateGroupDataForPage(activeGroup, router, routerGroupId, url)
      expect(router.replace).toHaveBeenCalled()
    })

    test("updateGroupDataForPage does nothing", () => {
      const routerGroupId = "1"
      updateGroupDataForPage(activeGroup, router, routerGroupId, url)
      expect(router.replace).toHaveBeenCalledTimes(0)
    })
  })

  describe("generateDisplayName", () => {
    const username = "user123"
    const firstName = "john"
    const lastname = "doe"

    test("display name returns username, firstname and lastname", () =>
      expect(generateDisplayName(username, firstName, lastname)).toBe(
        `${username} (${firstName} ${lastname})`
      ))

    test("display name returns username, firstname", () =>
      expect(generateDisplayName(username, firstName)).toBe(
        `${username} (${firstName})`
      ))

    test("display name returns username", () =>
      expect(generateDisplayName(username)).toBe(username))
  })
})
