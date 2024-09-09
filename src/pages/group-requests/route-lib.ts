import type {
  clientRouteType,
  updateGroupDataForPageType,
  userGroup,
} from "@/types"
import type { NextRouter } from "next/router"

export const groupRequestEffect = (
  activeGroup: userGroup,
  updateGroupDataForPage: updateGroupDataForPageType,
  setBackRoute: any,
  clearBackRoute: any,
  router: NextRouter,
  clientRoute: clientRouteType
) => {
  if (activeGroup) {
    updateGroupDataForPage(
      activeGroup,
      router,
      router.query.groupId as string,
      `${clientRoute.groupRequests}/${activeGroup.id}`
    )
    setBackRoute(`${clientRoute.manageGroup}/${activeGroup.id}`)
  }
  return () => clearBackRoute()
}
