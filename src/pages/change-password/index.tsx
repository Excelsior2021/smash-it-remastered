import Input from "@/src/components/input/input"
import apiRoute from "@/src/lib/api-route"
import { changePasswordFormFields } from "@/src/lib/form-fields"
import method from "@/src/lib/http-method"
import { useForm } from "react-hook-form"
import { changePassword, setPassword } from "@/src/lib/api"
import Modal from "@/src/components/modal/modal"
import { useEffect, useState } from "react"
import Toggle from "@/src/components/toggle/toggle"
import { protectedRoute } from "@/src/lib/auth"
import { getServerSession } from "next-auth"
import clientRoute from "@/src/lib/client-route"
import { authOptions } from "../api/auth/[...nextauth]"
import prisma from "@/src/lib/prisma"

import type { apiRouteType, methodType } from "@/types"
import type { FieldValues } from "react-hook-form"
import { useRouter } from "next/router"
import headerStore from "@/src/store/header"

type props = {
  hasPassword: boolean
}

const ChangePassword = ({ hasPassword }: props) => {
  const {
    register,
    handleSubmit,
    clearErrors,
    setError,
    watch,
    reset,
    formState: { errors },
  } = useForm()
  const [submitting, setSubmitting] = useState(false)
  const [showPasswords, setShowPasswords] = useState(false)
  const router = useRouter()
  const setBackRoute = headerStore(state => state.setBackRoute)
  const clearBackRoute = headerStore(state => state.clearBackRoute)

  let newPassword: string

  useEffect(() => {
    setBackRoute(clientRoute.account)
    return () => clearBackRoute()
  }, [setBackRoute, clearBackRoute])

  const handleChangePassword = async (
    formData: FieldValues,
    apiRoute: apiRouteType,
    method: methodType
  ) => {
    try {
      setSubmitting(true)
      let res
      if (hasPassword) res = await changePassword(formData, apiRoute, method)
      else res = await setPassword(formData, apiRoute, method)

      if (res && res.ok) {
        document.getElementById("modal").showModal()
        reset()
      } else if (res) {
        const { field, error } = await res.json()
        setError(field, {
          message: error,
        })
      }
    } catch (error) {
      console.log(error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <h1 className="text-3xl text-center capitalize mb-10">
        {hasPassword ? "change password" : "set password"}
      </h1>
      <form
        className="flex flex-col gap-10 max-w-[500px] m-auto"
        onSubmit={handleSubmit(async formData =>
          handleChangePassword(formData, apiRoute, method)
        )}>
        {changePasswordFormFields.map(field => {
          if (!hasPassword && field.name === "currentPassword") return
          if (field.name === "newPassword") newPassword = watch(field.name)
          field.type = showPasswords ? "text" : "password"
          return (
            <div className="flex flex-col gap-2" key={field.name}>
              <Input
                label={field.label}
                name={field.name}
                type={field.type}
                register={register}
                required={field.required}
                pattern={field.pattern}
                validate={
                  field.validate
                    ? (value: string) => field.validate(value, newPassword)
                    : null
                }
                className="input text-black w-full"
                info={field.info}
                onChange={() => clearErrors(field.name)}
                disabled={submitting}
              />
              {errors[field.name] && (
                <p className="text-error">{errors[field.name].message}</p>
              )}
            </div>
          )
        })}
        <Toggle
          text="show passwords"
          onChange={() => setShowPasswords(prev => !prev)}
        />
        <button className="btn btn-secondary" disabled={submitting}>
          {submitting ? (
            <span className="loading loading-bars loading-sm"></span>
          ) : hasPassword ? (
            " change password"
          ) : (
            "set password"
          )}
        </button>
      </form>
      <Modal
        heading={hasPassword ? "change password" : "set password"}
        text={
          hasPassword
            ? "password changed successfully"
            : "password set successfully"
        }
        onClickClose={() => router.replace(clientRoute.account)}
      />
    </div>
  )
}

export default ChangePassword

export const getServerSideProps = async context => {
  const props = await protectedRoute(
    context,
    getServerSession,
    clientRoute,
    authOptions
  )
  const { authenticated, session } = props
  if (!authenticated) return props

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      password: true,
    },
  })

  if (user && user.password)
    return {
      props: {
        hasPassword: true,
      },
    }

  return {
    props: {},
  }
}
