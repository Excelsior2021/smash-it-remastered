import type {
  apiRequestType,
  apiRouteType,
  clientRouteType,
  makeRequestType,
  methodType,
  showModalType,
} from "@/types"
import type { FieldValues, UseFormSetError } from "react-hook-form"

export const forgottenPasswordEffect = (
  setBackRoute: any,
  clearBackRoute: any,
  clientRoute: clientRouteType
) => {
  setBackRoute(clientRoute.login)
  return () => clearBackRoute()
}

export const handleForgottenPassword = async (
  makeRequest: makeRequestType,
  forgottenPassword: apiRequestType,
  { email }: FieldValues,
  showModal: showModalType,
  setError: UseFormSetError<FieldValues>,
  apiRoute: apiRouteType,
  method: methodType
) => {
  try {
    const res = await forgottenPassword(makeRequest, email, apiRoute, method)

    if (res && !res.ok) {
      const { error } = await res.json()
      setError("server", {
        message: error,
        type: "server",
      })
      return
    }

    if (res && res.ok) showModal()
  } catch (error) {
    console.log(error)
  }
}
