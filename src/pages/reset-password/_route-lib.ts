import type {
  apiRouteType,
  makeRequestType,
  methodType,
  resetPasswordType,
  showModalType,
} from "@/types"
import type { FieldValues } from "react-hook-form"

export const handleResetPassword = async (
  makeRequest: makeRequestType,
  resetPassword: resetPasswordType,
  showModal: showModalType,
  formData: FieldValues,
  token: string,
  apiRoute: apiRouteType,
  method: methodType
) => {
  try {
    const res = await resetPassword(
      makeRequest,
      formData,
      token,
      apiRoute,
      method
    )
    if (res && res.ok) showModal()
  } catch (error) {
    console.log(error)
  }
}
