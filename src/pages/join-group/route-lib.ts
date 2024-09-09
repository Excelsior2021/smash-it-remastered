import { debounce } from "@/lib/utils"
import type {
  apiRequestType,
  apiRouteType,
  getUserGroupsType,
  groupRequest,
  makeRequestType,
  methodType,
  userGroup,
} from "@/types"
import type { Dispatch, SetStateAction } from "react"
import type { FieldValues } from "react-hook-form"

export const handleQueryGroupsDebounceCallback = async (
  queryGroups: apiRequestType,
  makeRequest: makeRequestType,
  formData: FieldValues,
  setGroups: Dispatch<SetStateAction<userGroup[] | null>>,
  getGroupRequests: getUserGroupsType,
  setGroupRequestsState: Dispatch<SetStateAction<groupRequest[]>>,
  apiRoute: apiRouteType,
  method: methodType
) => {
  const res: Awaited<Response> = await queryGroups(
    makeRequest,
    formData,
    apiRoute,
    method
  )

  const res2: Awaited<Response> = await getGroupRequests(makeRequest, apiRoute)

  if (res && res.ok && res2 && res2.ok) {
    setGroups(await res.json())
    setGroupRequestsState(await res2.json())
  } else setGroups(null)
}

export const handleQueryGroups = debounce(
  handleQueryGroupsDebounceCallback,
  250
)
