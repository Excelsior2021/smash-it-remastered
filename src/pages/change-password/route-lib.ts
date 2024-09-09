import type {
  apiRequestType,
  apiRouteType,
  clientRouteType,
  makeRequestType,
  methodType,
  showModalType,
} from "@/types"
import type {
  FieldValues,
  UseFormReset,
  UseFormSetError,
} from "react-hook-form"

export const changePasswordEffect = (
  setBackRoute: any,
  clearBackRoute: any,
  clientRoute: clientRouteType
) => {
  setBackRoute(clientRoute.account)
  return () => clearBackRoute()
}

export const handleChangePassword = async (
  makeRequest: makeRequestType,
  changePassword: apiRequestType,
  setPassword: apiRequestType,
  showModal: showModalType,
  reset: UseFormReset<FieldValues>,
  setError: UseFormSetError<FieldValues>,
  hasPassword: boolean,
  formData: FieldValues,
  apiRoute: apiRouteType,
  method: methodType
) => {
  try {
    let res
    if (hasPassword)
      res = await changePassword(makeRequest, formData, apiRoute, method)
    else res = await setPassword(makeRequest, formData, apiRoute, method)

    if (res && res.ok) {
      showModal()
      reset()
    } else if (res) {
      const { field, error } = await res.json()
      setError(field, {
        message: error,
      })
    }
  } catch (error) {
    console.log(error)
  }
}
