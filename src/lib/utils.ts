import type { apiRouteType, getUserGroupsType, userGroup } from "@/types"
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
  getUserGroups: getUserGroupsType,
  setGroups: any,
  setActiveGroup: any,
  apiRoute: apiRouteType
) => {
  const res: Awaited<Response> = await getUserGroups(apiRoute)

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
