import type {
  apiRequestType,
  apiRouteType,
  clientRouteType,
  makeRequestType,
  methodType,
  userGroup,
} from "@/types"
import type { NextRouter } from "next/router"
import type { FieldValues, UseFormSetError } from "react-hook-form"

export const createGroupEffect = (
  setBackRoute: any,
  clearBackRoute: any,
  clientRoute: clientRouteType
) => {
  setBackRoute(clientRoute.joinCreateGroup)
  return () => clearBackRoute()
}

export const handleCreateGroup = async (
  createGroup: apiRequestType,
  makeRequest: makeRequestType,
  formData: FieldValues,
  userGroups: userGroup[],
  setGroups: any,
  setActiveGroup: any,
  setError: UseFormSetError<FieldValues>,
  router: NextRouter,
  clientRoute: clientRouteType,
  apiRoute: apiRouteType,
  method: methodType
) => {
  try {
    if (userGroups.length >= 3) {
      setError("maxGroupCount", {
        message:
          "max group count reached. (you can only be a member of a max. of 3 groups.)",
      })
      return
    }

    const res: Awaited<Response> = await createGroup(
      makeRequest,
      formData,
      apiRoute,
      method
    )

    if (!res.ok) {
      const data = await res.json()
      const errors = data.errors.filter(
        (error: string | boolean) => error && error
      )
      setError("server", {
        type: "server",
        message: errors,
      })
    } else {
      const { group } = await res.json()
      let newGroup = { id: group.id, name: group.name }
      setGroups([...userGroups, { ...newGroup }])
      setActiveGroup(newGroup)
      router.push(`${clientRoute.group}/${group.id}`)
    }
  } catch (error) {
    console.log(error)
  }
}
