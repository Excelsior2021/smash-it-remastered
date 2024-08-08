import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"
import {
  debounce,
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
      expect(router.replace).toHaveBeenCalledOnce()
      expect(router.replace).toHaveBeenCalledWith(url)
    })

    it("does not replace the url", () => {
      const routerGroupId = "1"
      updateGroupDataForPage(activeGroup, router, routerGroupId, url)
      expect(router.replace).not.toHaveBeenCalled()
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
      json: () => [{ mock: "data" }],
    })

    handleGetUserGroups(getUserGroups, setGroups, setActiveGroup, apiRoute)

    it("sets user's groups and active group", () => {
      expect(getUserGroups).toHaveBeenCalledOnce()
      expect(getUserGroups).toHaveBeenCalledWith(apiRoute)
      expect(setGroups).toHaveBeenCalledOnce()
      expect(setGroups).toHaveBeenCalledWith([{ mock: "data" }])
      expect(setActiveGroup).toHaveBeenCalledOnce()
      expect(setActiveGroup).toHaveBeenCalledWith({ mock: "data" })
    })
  })

  describe("debounce()", () => {
    beforeEach(() => {
      vi.useFakeTimers()
      debounce(cb)(1, 2, 3) //debounce returns a function
    })

    afterEach(() => {
      vi.resetAllMocks()
    })

    const cb = vi.fn()

    it("calls the callback after 1s has passed", () => {
      vi.runAllTimers()
      expect(cb).toHaveBeenCalledOnce()
      expect(cb).toHaveBeenCalledWith(1, 2, 3)
    })

    it("does not call the callback before 1s has passed", () => {
      vi.advanceTimersByTime(900)
      expect(cb).not.toHaveBeenCalled()
    })
  })
})
