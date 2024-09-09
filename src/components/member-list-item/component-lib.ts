import type {
  apiRouteType,
  makeRequestType,
  methodType,
  showModalType,
  userGroupApiType,
} from "@/types"
import type { Dispatch, SetStateAction } from "react"

export const handleActionCallback = async (
  makeRequest: makeRequestType,
  action: userGroupApiType,
  showModal: showModalType,
  setLoading: Dispatch<SetStateAction<boolean>>,
  setActionSuccess: Dispatch<SetStateAction<boolean>>,
  setShowMemberModal: Dispatch<SetStateAction<boolean>>,
  userId: number,
  groupId: number,
  apiRoute: apiRouteType,
  method: methodType
) => {
  try {
    setLoading(true)
    const res: Awaited<Response> = await action(
      makeRequest,
      userId,
      groupId,
      apiRoute,
      method
    )

    if (res.ok) setActionSuccess(true)
    if (res.status === 409) setTimeout(() => showModal(), 100)
  } catch (error) {
    console.log(error)
  } finally {
    setLoading(false)
    setShowMemberModal(false)
  }
}
