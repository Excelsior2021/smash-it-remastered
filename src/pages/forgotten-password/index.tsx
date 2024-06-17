//components
import Input from "@/src/components/input/input"
import Modal from "@/src/components/modal/modal"

//react
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"

//next
import Link from "next/link"
import { useRouter } from "next/router"

//lib
import { authRedirect } from "@/src/lib/auth"
import clientRoute from "@/src/lib/client-route"
import pattern from "@/src/lib/field-validation"
import { forgottenPassword } from "@/src/lib/api"
import apiRoute from "@/src/lib/api-route"
import method from "@/src/lib/http-method"

//store
import headerStore from "@/src/store/header"

//next-auth
import { getServerSession } from "next-auth"
import { authOptions } from "../api/auth/[...nextauth]"

//type
import type { FieldValues } from "react-hook-form"
import type { apiRouteType, changeAccountDetailType, methodType } from "@/types"
import type { GetServerSidePropsContext } from "next"

const ForgottenPassword = () => {
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm()
  const [submitting, setSubmmiting] = useState(false)
  const setBackRoute = headerStore(state => state.setBackRoute)
  const clearBackRoute = headerStore(state => state.clearBackRoute)
  const router = useRouter()

  useEffect(() => {
    setBackRoute(clientRoute.login)
    return () => clearBackRoute()
  }, [setBackRoute, clearBackRoute])

  const handleForgottenPassword = async (
    forgottenPassword: changeAccountDetailType,
    { email }: FieldValues,
    apiRoute: apiRouteType,
    method: methodType
  ) => {
    setSubmmiting(true)
    try {
      const res = await forgottenPassword(email, apiRoute, method)

      if (res && !res.ok) {
        const { error } = await res.json()
        setError("server", {
          message: error,
          type: "server",
        })
        return
      }

      if (res && res.ok) document.getElementById("modal").showModal()
    } catch (error) {
      console.log(error)
    } finally {
      setSubmmiting(false)
    }
  }

  return (
    <div className="max-w-[500px] m-auto">
      <h1 className="text-3xl text-center capitalize mb-6">
        reset password request
      </h1>
      <p className="text-xl text-center mb-6">
        Enter your email address below and a link will be sent to reset your
        password.
      </p>
      <form
        className="flex flex-col gap-8 mt-12 mb-6"
        onSubmit={handleSubmit(
          async formData =>
            await handleForgottenPassword(
              forgottenPassword,
              formData,
              apiRoute,
              method
            )
        )}>
        <div>
          <Input
            label="email address"
            name="email"
            type="email"
            pattern={{
              pattern: pattern.email,
              message: "please enter a valid email address.",
            }}
            className="input text-black w-full mb-2"
            register={register}
            onChange={() => clearErrors()}
            disabled={submitting}
          />
          {errors.email && <p>{errors.email.message as string}</p>}
          {errors.server && (
            <p className="text-error">{errors.server.message as string}</p>
          )}
        </div>

        <button className="btn btn-secondary" disabled={submitting}>
          {" "}
          {submitting ? (
            <span className="loading loading-bars loading-sm"></span>
          ) : (
            "submit"
          )}
        </button>
      </form>
      <p className="text-center">
        Login{" "}
        <Link className="link" href={clientRoute.login}>
          here
        </Link>
      </p>
      <Modal
        heading="reset password email sent"
        onClickClose={() => router.replace(clientRoute.login)}
      />
    </div>
  )
}

export default ForgottenPassword

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await authRedirect(
    context,
    getServerSession,
    clientRoute,
    authOptions
  )
  if (session) return session

  return {
    props: {},
  }
}
