import type {
  clientRouteType,
  profile,
  updateGroupDataForPageType,
  userGroup,
} from "@/types"
import type { NextRouter } from "next/router"

export const profileEffect = (
  sessionUserId: number,
  profile: profile,
  activeGroup: userGroup,
  groupId: string,
  noGroup: boolean | undefined,
  setActiveNavItem: any,
  updateGroupDataForPage: updateGroupDataForPageType,
  router: NextRouter,
  clientRoute: clientRouteType
) => {
  if (noGroup) setActiveNavItem("profile")

  if (!noGroup) {
    if (profile) if (profile.id === sessionUserId) setActiveNavItem("profile")
    if (activeGroup)
      updateGroupDataForPage(
        activeGroup,
        router,
        groupId,
        `${clientRoute.profile}/${activeGroup.id}/${profile.username}`
      )
  }
  return () => setActiveNavItem(null)
}
