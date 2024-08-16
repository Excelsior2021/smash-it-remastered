import type {
  apiRouteType,
  getUserGroupsType,
  makeRequestType,
  userGroup,
} from "@/types"
import type { NextRouter } from "next/router"

export const updateGroupDataForPage = (
  activeGroup: userGroup,
  router: NextRouter,
  routerGroupId: string,
  url: string
) => {
  if (activeGroup && parseInt(routerGroupId) !== activeGroup.id)
    router.replace(url)
}

export const generateDisplayName = (
  username: string,
  firstName?: string,
  lastName?: string
) => {
  if (firstName && lastName) return `${username} (${firstName} ${lastName})`
  else if (firstName) return `${username} (${firstName})`
  return username
}

export const handleGetUserGroups = async (
  makeRequest: makeRequestType,
  getUserGroups: getUserGroupsType,
  setGroups: any,
  setActiveGroup: any,
  apiRoute: apiRouteType
) => {
  const res: Awaited<Response> = await getUserGroups(makeRequest, apiRoute)

  const data = await res.json()

  if (res.ok) {
    setGroups(data)
    setActiveGroup(data[0])
  }
}

export const debounce = (cb: Function, delay = 1000) => {
  let timeout: ReturnType<typeof setTimeout>
  return (...args: any) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => cb(...args), delay)
  }
}

export const makeRequest = async (
  apiRoute: string,
  method: string = "GET",
  body: any = null
) => {
  let options: RequestInit | undefined = undefined
  if (method !== "GET")
    options = {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }

  return options ? await fetch(apiRoute, options) : fetch(apiRoute)
}

export const showModal = () => {
  const modal = document.getElementById("modal") as HTMLDialogElement
  return modal.showModal()
}
