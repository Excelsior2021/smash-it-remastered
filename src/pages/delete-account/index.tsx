//components
import Modal from "@/src/components/modal/modal"

//react
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"

//lib
import { deleteAccount } from "@/src/lib/api"
import clientRoute from "@/src/enums/client-route"
import apiRoute from "@/src/enums/api-route"
import method from "@/src/enums/http-method"
import { protectedRoute } from "@/src/lib/auth"

//store
import headerStore from "@/src/store/header"

//next-auth
import { signOut } from "next-auth/react"
import { authOptions } from "../api/auth/[...nextauth]"
import { getServerSession } from "next-auth"

//types
import type { FieldValues } from "react-hook-form"
import type { apiRouteType, methodType, noBodyApiType } from "@/types"
import { GetServerSidePropsContext } from "next"

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
  const [groups, setGroups] = useState(null)

  useEffect(() => {
    setBackRoute(clientRoute.account)
    return () => clearBackRoute()
  }, [setBackRoute, clearBackRoute])

  const handleDeleteAccount = async (
    deleteAccount: noBodyApiType,
    { deleteInput }: FieldValues,
    apiRoute: apiRouteType,
    method: methodType
  ) => {
    if (deleteInput === "delete") {
      const res = await deleteAccount(apiRoute, method)

      if (res && res.ok) {
        await signOut()
      }

      if (res && res.status === 409) {
        const data = await res.json()
        setGroups(data.needsAdmin)
        document.getElementById("modal").showModal()
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
          handleDeleteAccount(deleteAccount, formData, apiRoute, method)
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
      <Modal
        heading="Action Required"
        text="Please assign at least one other admin to the following group(s) below before deleting your account. This is to ensure the group(s) can be managed."
        groups={groups}
      />
    </div>
  )
}

export default DeleteAccount

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
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
