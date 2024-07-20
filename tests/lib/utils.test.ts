import { describe, expect, it, vi, beforeEach } from "vitest"
import {
  generateDisplayName,
  handleGetUserGroups,
  updateGroupDataForPage,
} from "@/src/lib/utils"
import { useRouter } from "next/router"
import { mockDeep, mockReset } from "vitest-mock-extended"
import apiRoute from "@/src/enums/api-route"

describe("lib/utils", () => {
  describe("updateGroupDataForPage()", () => {
    const router = mockDeep(useRouter())

    beforeEach(() => {
      vi.mock("next/router", () => ({
        useRouter: vi.fn(() => ({
          replace: vi.fn(),
        })),
      }))
      mockReset(router)
    })

    const activeGroup = {
      id: 1,
      name: "myGroup",
    }
    const url = "mypage.com"

    it("replaces url", () => {
      const routerGroupId = "2"
      updateGroupDataForPage(activeGroup, router, routerGroupId, url)
      expect(router.replace).toHaveBeenCalled()
    })

    it("does not replace the url", () => {
      const routerGroupId = "1"
      updateGroupDataForPage(activeGroup, router, routerGroupId, url)
      expect(router.replace).toHaveBeenCalledTimes(0)
    })
  })

  describe("generateDisplayName()", () => {
    const username = "user123"
    const firstName = "john"
    const lastname = "doe"

    it("returns username, firstname and lastname", () =>
      expect(generateDisplayName(username, firstName, lastname)).toBe(
        `${username} (${firstName} ${lastname})`
      ))

    it("returns username, firstname", () =>
      expect(generateDisplayName(username, firstName)).toBe(
        `${username} (${firstName})`
      ))

    it("returns username", () =>
      expect(generateDisplayName(username)).toBe(username))
  })

  describe("handleGetUserGroups()", () => {
    const getUserGroups = vi.fn()
    const setGroups = vi.fn()
    const setActiveGroup = vi.fn()

    getUserGroups.mockResolvedValue({
      ok: true,
      json: () => [{}],
    })

    handleGetUserGroups(getUserGroups, setGroups, setActiveGroup, apiRoute)

    it("sets user's groups and active group", () => {
      expect(getUserGroups).toHaveBeenCalledOnce()
      expect(getUserGroups).toHaveBeenCalledWith(apiRoute)
      expect(setGroups).toHaveBeenCalledOnce()
      expect(setActiveGroup).toHaveBeenCalledOnce()
    })
  })

  describe("debounce()", () => {
    it("", () => {
      expect(1).toBe(1)
    })
  })
})
