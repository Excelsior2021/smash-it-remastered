import type {
  apiRouteType,
  clientRouteType,
  makeRequestType,
  methodType,
  showModalType,
  updateGroupDataForPageType,
  userGroup,
  userGroupApiType,
} from "@/types"
import type { NextRouter } from "next/router"
import type { Dispatch, SetStateAction } from "react"

export const groupEffect = (
  activeGroup: userGroup,
  setActiveNavItem: any,
  updateGroupDataForPage: updateGroupDataForPageType,
  router: NextRouter,
  clientRoute: clientRouteType
) => {
  setActiveNavItem("group")
  if (activeGroup)
    updateGroupDataForPage(
      activeGroup,
      router,
      router.query.groupId as string,
      `${clientRoute.group}/${activeGroup.id}`
    )
  return () => setActiveNavItem(null)
}

export const handleLeaveGroup = async (
  makeRequest: makeRequestType,
  removeUserFromGroup: userGroupApiType,
  userId: number,
  groupId: number,
  showModal: showModalType,
  setNeedAdmin: Dispatch<SetStateAction<boolean>>,
  setLeftGroup: Dispatch<SetStateAction<boolean>>,
  setSubmitting: Dispatch<SetStateAction<boolean>>,
  apiRoute: apiRouteType,
  method: methodType
) => {
  setSubmitting(true)
  try {
    const res: Awaited<Response> = await removeUserFromGroup(
      makeRequest,
      userId,
      groupId,
      apiRoute,
      method
    )

    if (res && res.status === 409) {
      setNeedAdmin(true)
      setTimeout(() => showModal())
    }

    if (res && res.ok) {
      setNeedAdmin(false)
      setLeftGroup(true)
      setTimeout(() => showModal())
    }
  } catch (error) {
    console.log(error)
  } finally {
    setSubmitting(false)
  }
}
