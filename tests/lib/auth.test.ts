import { describe, expect, it, test, vi } from "vitest"
import {
  adminRoute,
  authRedirect,
  hashPassword,
  notAdmin,
  protectedRoute,
} from "@/lib/auth"
import { clientRoute } from "@/enums"
import prisma from "./__mocks__/prisma"

describe("lib/auth", () => {
  const authOptions = {}

  const context = {
    req: null,
    res: null,
    query: {
      groupId: "1",
    },
  } as any

  describe("hashPassword()", () => {
    const password = "password"
    const hash = vi.fn()
    const salt = 10
    it("returns hashed password", () => {
      hashPassword(password, hash, salt)

      expect(hash).toHaveBeenCalledWith(password, salt)
    })
  })

  describe("protectedRoute()", () => {
    let route = "/"

    describe("no session", () => {
      const getServerSession = vi.fn(() => false) as any

      test("client route - root", async () => {
        expect(
          await protectedRoute(
            context,
            getServerSession,
            clientRoute,
            authOptions,
            route
          )
        ).toStrictEqual({
          props: {
            authenticated: false,
          },
        })
      })

      test("client route - not root", async () => {
        route = "something"
        const getServerSession = vi.fn(() => false) as any

        expect(
          await protectedRoute(
            context,
            getServerSession,
            clientRoute,
            authOptions,
            route
          )
        ).toStrictEqual({
          props: {
            authenticated: false,
          },
          redirect: { destination: clientRoute.login, permanent: false },
        })
      })
    })

    describe("session", () => {
      const session = { session: {} }
      const getServerSession = vi.fn(() => session) as any

      it("returns session object", async () => {
        expect(
          await protectedRoute(
            context,
            getServerSession,
            clientRoute,
            authOptions,
            route
          )
        ).toStrictEqual({ authenticated: true, session })
      })
    })
  })

  describe("adminRoute()", () => {
    const session = {
      user: {
        id: 1,
      },
    }

    it("returns true", async () => {
      prisma.stat.findUnique.mockResolvedValueOnce({
        isAdmin: true,
      })
      expect(await adminRoute(context, session, prisma)).toBe(true)
    })

    it("returns false", async () => {
      prisma.stat.findUnique.mockResolvedValueOnce(null)
      expect(await adminRoute(context, session, prisma)).toBe(false)
    })
  })

  describe("notAdmin()", () => {
    it("returns redirect object", () => {
      expect(notAdmin(context, clientRoute)).toStrictEqual({
        redirect: {
          destination: `${clientRoute.group}/${context.query.groupId}`,
          permanent: false,
        },
      })
    })
  })

  describe("authRedirect()", () => {
    const contextMock = {
      req: {},
      res: {},
    } as any
    const authOptionsMock = {}

    it("returns redirect object", async () => {
      const getServerSessionMock = vi.fn(() => true) as any

      const redirect = await authRedirect(
        contextMock,
        getServerSessionMock,
        clientRoute,
        authOptionsMock
      )

      expect(getServerSessionMock).toHaveBeenCalledOnce()
      expect(getServerSessionMock).toHaveBeenCalledWith(
        contextMock.req,
        contextMock.res,
        authOptionsMock
      )
      expect(redirect).toStrictEqual({
        redirect: { destination: clientRoute.root, permanent: false },
      })
    })

    it("returns undefined", async () => {
      const getServerSessionMock = vi.fn(() => false) as any
      const redirect = await authRedirect(
        contextMock,
        getServerSessionMock,
        clientRoute,
        authOptionsMock
      )
      expect(redirect).toBe(undefined)
    })
  })
})
