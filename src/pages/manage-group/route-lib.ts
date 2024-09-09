import { clientRoute } from "@/enums"
import type {
  clientRouteType,
  updateGroupDataForPageType,
  userGroup,
} from "@/types"
import type { NextRouter } from "next/router"

export const manageGroupLinks = [
  {
    key: 1,
    hrefPrefix: clientRoute.groupRequests,
    text: "requests",
  },
  {
    key: 2,
    hrefPrefix: clientRoute.approveMatches,
    text: "approve matches",
  },
  {
    key: 3,
    hrefPrefix: clientRoute.addAdmin,
    text: "add to admins",
  },
  {
    key: 4,
    hrefPrefix: clientRoute.removeMembers,
    text: "remove members",
  },
]

export const manageGroupEffect = (
  activeGroup: userGroup,
  updateGroupDataForPage: updateGroupDataForPageType,
  setActiveNavItem: any,
  setBackRoute: any,
  clearBackRoute: any,
  groupId: string,
  router: NextRouter,
  clientRoute: clientRouteType
) => {
  setActiveNavItem("group")
  if (activeGroup) {
    updateGroupDataForPage(
      activeGroup,
      router,
      groupId as string,
      `${clientRoute.manageGroup}/${activeGroup.id}`
    )
    setBackRoute(`${clientRoute.group}/${activeGroup.id}`)
  }

  return () => {
    setActiveNavItem(null)
    clearBackRoute()
  }
}
