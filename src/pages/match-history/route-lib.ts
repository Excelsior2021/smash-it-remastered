import type {
  clientRouteType,
  updateGroupDataForPageType,
  userGroup,
} from "@/types"
import type { NextRouter } from "next/router"

export const matchHistoryEffect = (
  activeGroup: userGroup,
  updateGroupDataForPage: updateGroupDataForPageType,
  username: string,
  groupId: string,
  setBackRoute: any,
  clearBackRoute: any,
  router: NextRouter,
  clientRoute: clientRouteType
) => {
  if (activeGroup) {
    updateGroupDataForPage(
      activeGroup,
      router,
      groupId as string,
      `${clientRoute.matchHistory}/${activeGroup.id}/${username}`
    )
    setBackRoute(`${clientRoute.profile}/${activeGroup.id}/${username}`)
  }

  return () => clearBackRoute()
}
