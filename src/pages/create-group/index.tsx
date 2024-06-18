//components
import Input from "@/src/components/input/input"
import EmailUnverifiedMessage from "@/src/components/email-unverified-message/email-unverified-message"

//react
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"

//next
import { useRouter } from "next/router"

//lib
import { createGroup } from "@/src/lib/api"
import clientRoute from "@/src/lib/client-route"
import { protectedRoute } from "@/src/lib/auth"
import apiRoute from "@/src/lib/api-route"
import method from "@/src/lib/http-method"
import pattern from "@/src/lib/field-validation"

//store
import headerStore from "@/src/store/header"
import userStore from "@/src/store/user"

//next-auth
import { authOptions } from "../api/auth/[...nextauth]"
import { getServerSession } from "next-auth"

//types
import type {
  clientRouteType,
  apiRouteType,
  methodType,
  changeAccountDetailType,
  userGroup,
} from "@/types"
import type { NextRouter } from "next/router"
import type { FieldValues, UseFormSetError } from "react-hook-form"
import type { GetServerSidePropsContext } from "next"

type props = {
  emailUnverified?: true
}

const CreateGroup = ({ emailUnverified }: props) => {
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm()

  const router = useRouter()
  const userGroups = userStore(state => state.groups)
  const setGroups = userStore(state => state.setGroups)
  const setActiveGroup = userStore(state => state.setActiveGroup)
  const setBackRoute = headerStore(state => state.setBackRoute)
  const clearBackRoute = headerStore(state => state.clearBackRoute)
  const [submitting, setSubmitting] = useState(false)

  const handleCreateGroup = async (
    createGroup: changeAccountDetailType,
    formData: FieldValues,
    setError: UseFormSetError<FieldValues>,
    router: NextRouter,
    clientRoute: clientRouteType,
    apiRoute: apiRouteType,
    method: methodType
  ) => {
    setSubmitting(true)
    try {
      if (userGroups.length >= 3) {
        setError("maxGroupCount", {
          message:
            "max group count reached. (you can only be a member of a max. of 3 groups.)",
        })
        return
      }

      const res = (await createGroup(formData, apiRoute, method)) as Response

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
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    setBackRoute(clientRoute.joinCreateGroup)
    return () => clearBackRoute()
  }, [setBackRoute, clearBackRoute])

  if (emailUnverified) return <EmailUnverifiedMessage />

  return (
    <div>
      <h1 className="text-3xl text-center mb-8 capitalize">create a group</h1>
      <form
        className="flex flex-col gap-8 max-w-96 m-auto"
        onSubmit={handleSubmit(formData =>
          handleCreateGroup(
            createGroup,
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
        <button className="btn btn-secondary">
          {submitting ? (
            <span className="loading loading-bars loading-sm"></span>
          ) : (
            "create group"
          )}
        </button>
      </form>
      <p className="text-center m-6">
        When you create a group you will be an admin for the group.
      </p>
    </div>
  )
}

export default CreateGroup

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const props = await protectedRoute(
    context,
    getServerSession,
    clientRoute,
    authOptions
  )
  const { authenticated, session } = props
  if (!authenticated) return props

  if (!session.user.emailVerified)
    return {
      props: {
        emailUnverified: true,
      },
    }

  return {
    props: {},
  }
}
