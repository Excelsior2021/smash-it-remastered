import type { Dispatch, SetStateAction } from "react"
import type { Session } from "next-auth"
import type { NextRouter } from "next/router"
import type { FieldValues, UseFormSetError } from "react-hook-form"
import type {
  apiRequestType,
  apiRouteType,
  clientRouteType,
  makeRequestType,
  methodType,
} from "@/types"

export enum submissionStatus {
  pending,
  success,
  failed,
}

export const accountDetailsEffect = (
  setBackRoute: any,
  clearBackRoute: any,
  clientRoute: clientRouteType
) => {
  setBackRoute(clientRoute.account)
  return () => clearBackRoute()
}

export const handleChangeAccountDetail = async (
  makeRequest: makeRequestType,
  changeAccountDetail: apiRequestType,
  update: (data?: any) => Promise<Session | null>,
  setSubmission: Dispatch<SetStateAction<submissionStatus>>,
  setServerError: Dispatch<SetStateAction<boolean>>,
  setError: UseFormSetError<FieldValues>,
  router: NextRouter,
  formData: FieldValues,
  apiRoute: apiRouteType,
  method: methodType
) => {
  try {
    const res = await changeAccountDetail(
      makeRequest,
      formData,
      apiRoute,
      method
    )

    if (res && res.ok) {
      router.replace(router.asPath)
      const data = await res?.json()
      update({ [data.field]: data.value })
      setSubmission(submissionStatus.success)
    } else {
      const data = await res?.json()
      const errors = data.errors.filter((error: string) => error && error)
      setServerError(true)
      setError("server", {
        type: "server",
        message: errors,
      })
    }
  } catch (error) {
    console.log(error)
  }
}
