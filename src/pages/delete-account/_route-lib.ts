import type {
  apiRouteType,
  clientRouteType,
  deleteAccountType,
  makeRequestType,
  methodType,
  showModalType,
  signOutNextAuth,
} from "@/types"
import type { Dispatch, SetStateAction } from "react"
import type { FieldValues, UseFormSetError } from "react-hook-form"

export const deleteAccountEffect = (
  setBackRoute: any,
  clearBackRoute: any,
  clientRoute: clientRouteType
) => {
  setBackRoute(clientRoute.account)
  return () => clearBackRoute()
}

export const handleDeleteAccount = async (
  makeRequest: makeRequestType,
  deleteAccount: deleteAccountType,
  { deleteInput }: FieldValues,
  signOut: signOutNextAuth,
  setGroups: Dispatch<SetStateAction<null>>,
  setError: UseFormSetError<FieldValues>,
  showModal: showModalType,
  apiRoute: apiRouteType,
  method: methodType
) => {
  if (deleteInput === "delete") {
    const res = await deleteAccount(makeRequest, apiRoute, method)

    if (res && res.ok) {
      await signOut()
    }

    if (res && res.status === 409) {
      const data = await res.json()
      setGroups(data.needsAdmin)
      showModal()
    }
  } else {
    setError("delete", {
      message: "please enter 'delete' in the input field",
    })
  }
}
