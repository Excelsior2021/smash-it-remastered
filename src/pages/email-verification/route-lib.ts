import type {
  apiRouteType,
  makeRequestType,
  showModalType,
  verifyEmailType,
} from "@/types"
import type { Dispatch, SetStateAction } from "react"

export const handleVerifyEmail = async (
  makeRequest: makeRequestType,
  verifyEmail: verifyEmailType,
  showModal: showModalType,
  setError: Dispatch<SetStateAction<null>>,
  apiRoute: apiRouteType
) => {
  const res = await verifyEmail(makeRequest, apiRoute)

  if (res && !res.ok) {
    const data = await res.json()
    setError(data.error)
  }

  if (res && res.ok) showModal()
}
