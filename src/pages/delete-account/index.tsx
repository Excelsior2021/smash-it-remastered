//components
import Modal from "@/components/modal/modal"

//react
import { useEffect, useState, type ReactNode } from "react"
import { useForm } from "react-hook-form"

//lib
import {
  deleteAccountEffect,
  handleDeleteAccount,
} from "@/lib/route-libs/delete-account"
import { makeRequest, showModal } from "@/lib/utils"
import { deleteAccount } from "@/lib/api"
import { clientRoute } from "@/enums"
import { apiRoute } from "@/enums"
import { method } from "@/enums"
import { protectedRoute } from "@/lib/auth"

//store
import headerStore from "@/store/header"

//next-auth
import { signOut } from "next-auth/react"
import { authOptions } from "../api/auth/[...nextauth]"
import { getServerSession } from "next-auth"

//types
import { GetServerSidePropsContext } from "next"

const DeleteAccount = () => {
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm()
  const setBackRoute = headerStore(state => state.setBackRoute)
  const clearBackRoute = headerStore(state => state.clearBackRoute)
  const [groups, setGroups] = useState(null)

  useEffect(
    () => deleteAccountEffect(setBackRoute, clearBackRoute, clientRoute),
    [setBackRoute, clearBackRoute]
  )

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
          handleDeleteAccount(
            makeRequest,
            deleteAccount,
            formData,
            signOut,
            setGroups,
            setError,
            showModal,
            apiRoute,
            method
          )
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
            <p className="text-error">{errors.delete.message as ReactNode}</p>
          )}
        </div>
        <button
          disabled={isSubmitting}
          className="btn w-full bg-[#a9353ff1] hover:bg-[#832931f1] border-0">
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
