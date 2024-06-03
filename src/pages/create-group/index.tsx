import Input from "@/src/components/input/input"
import { createGroup } from "@/src/lib/api"
import clientRoute from "@/src/lib/client-route"
import { useRouter } from "next/router"
import { useForm } from "react-hook-form"
import { useEffect } from "react"
import headerStore from "@/src/store/header"
import { protectedRoute } from "@/src/lib/auth"
import userStore from "@/src/store/user"
import { authOptions } from "../api/auth/[...nextauth]"
import { getServerSession } from "next-auth"
import apiRoute from "@/src/lib/api-route"
import method from "@/src/lib/http-method"

import type { clientRouteType, apiRouteType, methodType } from "@/types"
import type { NextRouter } from "next/router"
import type { FieldValues, UseFormSetError } from "react-hook-form"
import pattern from "@/src/lib/field-validation"

const CreateGroup = () => {
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm()

  const router = useRouter()
  const userGroups = userStore(state => state.groups)
  const setActiveGroup = userStore(state => state.setActiveGroup)
  const setBackRoute = headerStore(state => state.setBackRoute)
  const clearBackRoute = headerStore(state => state.clearBackRoute)

  const handleCreateGroup = async (
    { groupName }: FieldValues,
    setError: UseFormSetError<FieldValues>,
    router: NextRouter,
    clientRoute: clientRouteType,
    apiRoute: apiRouteType,
    method: methodType
  ) => {
    if (userGroups.length >= 3) {
      setError("maxGroupCount", {
        message:
          "max group count reached. (you can only be a member of a max. of 3 groups.)",
      })
      return
    }

    const res = (await createGroup({ groupName }, apiRoute, method)) as Response

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
      setActiveGroup({ id: group.id, name: group.name })
      router.push(`${clientRoute.group}/${group.id}`)
    }
  }

  useEffect(() => {
    setBackRoute(clientRoute.joinCreateGroup)
    return () => clearBackRoute()
  }, [setBackRoute, clearBackRoute])

  return (
    <div>
      <h1 className="text-3xl text-center mb-8 capitalize">
        create a new group
      </h1>
      <form
        className="flex flex-col gap-8 max-w-96 m-auto"
        onSubmit={handleSubmit(formData =>
          handleCreateGroup(
            formData,
            setError,
            router,
            clientRoute,
            apiRoute,
            method
          )
        )}>
        <div className="flex flex-col gap-2">
          <Input
            label="group name"
            name="groupName"
            className="input text-black w-full"
            type="text"
            pattern={{
              value: pattern.groupName,
              message:
                "group name is invalid. group names can only be a max of 20 characters.",
            }}
            register={register}
            onChange={() => clearErrors()}
          />
          {errors.groupName && (
            <p className="text-error text-center">
              {errors.groupName.message as string}
            </p>
          )}
          {errors.server &&
            errors.server.message.map((error: string) => (
              <p key={error} className="text-error text-center">
                {error}
              </p>
            ))}
          {errors.maxGroupCount && (
            <p className="text-error text-center">
              {errors.maxGroupCount.message as string}
            </p>
          )}
        </div>
        <button className="btn btn-secondary">create group</button>
      </form>
      <p className="text-center m-6">
        When you create a group you will be an admin for the group.
      </p>
    </div>
  )
}

export default CreateGroup

export const getServerSideProps = async context => {
  const props = await protectedRoute(
    context,
    getServerSession,
    clientRoute,
    authOptions
  )
  const { authenticated, session } = props
  if (!authenticated) return props

  return {
    props: {},
  }
}
