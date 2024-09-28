import type { FieldValues, UseFormSetError } from "react-hook-form"
import type {
  apiRequestType,
  apiRouteType,
  makeRequestType,
  methodType,
  showModalType,
} from "@/types"

export const handleCreateAccount = async (
  createAccount: apiRequestType,
  makeRequest: makeRequestType,
  showModal: showModalType,
  setError: UseFormSetError<FieldValues>,
  formData: FieldValues,
  apiRoute: apiRouteType,
  method: methodType
) => {
  try {
    const res: Awaited<Response> = await createAccount(
      makeRequest,
      formData,
      apiRoute,
      method
    )

    if (res.ok) showModal()
    else {
      const serverErrors = await res.json()

      if (res.status === 500) {
        setError("server", {
          type: "server",
          message: serverErrors.error,
        })
        return
      }

      for (const error in serverErrors.errors) {
        serverErrors.errors[error] = serverErrors.errors[error].filter(
          (error: string | boolean) => error && error
        )
        if (serverErrors.errors[error].length > 0)
          setError(error, {
            type: "server",
            message: serverErrors.errors[error],
          })
      }
    }
  } catch (error) {
    console.log(error)
  }
}
