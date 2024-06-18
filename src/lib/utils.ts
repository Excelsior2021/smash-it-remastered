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
  setActiveGroups: any,
  apiRoute: apiRouteType
) => {
  const res = (await getUserGroups(apiRoute)) as Response

  const data = await res.json()

  if (res.ok) {
    setGroups(data)
    setActiveGroups(data[0])
  }
}
