import Input from "@/src/components/input/input"
import { createGroup } from "@/src/lib/api"
import clientRoute from "@/src/lib/client-route"
import { useRouter } from "next/router"
import { useForm } from "react-hook-form"
import { useEffect } from "react"
import headerStore from "@/src/store/header"
import { protectedRoute } from "@/src/lib/auth"
import userStore from "@/src/store/user"

import type { clientRoute as Routes } from "@/types"
import type { NextRouter } from "next/router"
import type { FieldValues, UseFormSetError } from "react-hook-form"

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
    routes: Routes
  ) => {
    if (userGroups.length >= 3) {
      setError("maxGroupCount", {
        message:
          "max group count reached. (you can be a member of a max. of 3 groups.)",
      })
      return
    }

    const res = await createGroup({ groupName })

    if (res)
      if (!res.ok) {
        setError("server", {
          statusCode: res.status,
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
          handleCreateGroup(formData, setError, router, routes)
        )}>
        <div className="flex flex-col gap-2">
          <Input
            label="group name"
            name="groupName"
            className="input text-black"
            type="text"
            register={register}
            onChange={() => clearErrors()}
          />
          {errors.server?.statusCode === 409 && (
            <p className="text-error text-center">group name already exists</p>
          )}
          {(errors.maxGroupCount || errors.server?.statusCode === 400) && (
            <p className="text-error text-center">
              max group count reached. (you can be a member of a max. of 3
              groups.)
            </p>
          )}
          {errors.server?.statusCode === 500 && (
            <p className="text-error text-center">
              an error occured on the server. please try again.
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
  const props = await protectedRoute(context)
  const { authenticated, session } = props
  if (!authenticated) return props

  return {
    props: {},
  }
}
