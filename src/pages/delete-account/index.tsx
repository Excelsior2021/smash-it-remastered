import { useForm } from "react-hook-form"
import { deleteAccount } from "@/src/lib/api"
import { signOut } from "next-auth/react"
import { protectedRoute } from "@/src/lib/auth"
import { authOptions } from "../api/auth/[...nextauth]"
import { getServerSession } from "next-auth"
import clientRoute from "@/src/lib/client-route"
import apiRoute from "@/src/lib/api-route"
import method from "@/src/lib/http-method"

import type { FieldValues } from "react-hook-form"
import { apiRouteType, methodType } from "@/types"
import headerStore from "@/src/store/header"
import { useEffect } from "react"

const DeleteAccount = () => {
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm()

  const setBackRoute = headerStore(state => state.setBackRoute)
  const clearBackRoute = headerStore(state => state.clearBackRoute)

  useEffect(() => {
    setBackRoute(clientRoute.account)
    return () => clearBackRoute()
  }, [setBackRoute, clearBackRoute])

  const handleDeleteAccount = async (
    { deleteInput }: FieldValues,
    apiRoute: apiRouteType,
    method: methodType
  ) => {
    if (deleteInput === "delete") {
      const res = await deleteAccount(apiRoute, method)
      if (res)
        if (res.ok) {
          await signOut()
        }
    } else {
      setError("delete", {
        message: "please enter 'delete' in the input field",
      })
    }
  }

  return (
    <div>
      <h1 className="text-3xl text-center m-auto capitalize mb-10">
        delete account
      </h1>
      <p className="text-xl text-center my-6">
        Deleteing your account will delete all personal data associated with
        this account
      </p>

      <p className="text-xl text-center my-6">
        If you want to continue please type &quot;delete&quot; below.
      </p>

      <form
        className="flex flex-col items-center gap-6 w-full max-w-60 m-auto"
        onSubmit={handleSubmit(async formData =>
          handleDeleteAccount(formData, apiRoute, method)
        )}>
        <label className="hidden" htmlFor="deleteAccount">
          delete account
        </label>
        <div>
          <input
            {...register("deleteInput")}
            className="input text-black w-full mb-2"
            type="text"
            onChange={() => clearErrors()}
          />
          {errors.delete && (
            <p className="text-error">{errors.delete.message}</p>
          )}
        </div>
        <button className="btn w-full bg-[#a9353ff1] hover:bg-[#832931f1] border-0">
          delete account
        </button>
      </form>
    </div>
  )
}

export default DeleteAccount

export const getServerSideProps = async context => {
  const props = await protectedRoute(
    context,
    getServerSession,
    clientRoute,
    authOptions
  )
  const { authenticated } = props
  if (!authenticated) return props

  return {
    props: {},
  }
}
