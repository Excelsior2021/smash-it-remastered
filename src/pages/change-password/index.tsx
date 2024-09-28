//components
import Input from "@/components/input/input"
import Modal from "@/components/modal/modal"
import EmailUnverifiedMessage from "@/components/email-unverified-message/email-unverified-message"
import Toggle from "@/components/toggle/toggle"

//react
import { useEffect, useState, type ReactNode } from "react"
import { useForm } from "react-hook-form"

//next
import { useRouter } from "next/router"

//lib
import {
  changePasswordEffect,
  handleChangePassword,
} from "@/lib/route-libs/change-password"
import prisma from "@/lib/prisma"
import { changePasswordFormFields } from "@/lib/form-fields"
import { changePassword, setPassword } from "@/lib/api"
import { protectedRoute } from "@/lib/auth"
import { clientRoute } from "@/enums"
import { apiRoute } from "@/enums"
import { method } from "@/enums"
import { makeRequest, showModal } from "@/lib/utils"

//store
import headerStore from "@/store/header"

import { getServerSession } from "next-auth"
import { authOptions } from "../api/auth/[...nextauth]"

//types
import type { GetServerSidePropsContext } from "next"

type props = {
  hasPassword: boolean
  emailUnverified: true | undefined
}

const ChangePassword = ({ hasPassword, emailUnverified }: props) => {
  const {
    register,
    handleSubmit,
    clearErrors,
    setError,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm()
  const [showPasswords, setShowPasswords] = useState(false)
  const router = useRouter()
  const setBackRoute = headerStore(state => state.setBackRoute)
  const clearBackRoute = headerStore(state => state.clearBackRoute)

  let newPassword: string

  useEffect(
    () => changePasswordEffect(setBackRoute, clearBackRoute, clientRoute),
    [setBackRoute, clearBackRoute]
  )

  if (emailUnverified) return <EmailUnverifiedMessage />

  return (
    <div>
      <h1 className="text-3xl text-center capitalize mb-10">
        {hasPassword ? "change password" : "set password"}
      </h1>
      <form
        className="flex flex-col gap-10 max-w-[500px] m-auto"
        onSubmit={handleSubmit(async formData =>
          handleChangePassword(
            makeRequest,
            changePassword,
            setPassword,
            showModal,
            reset,
            setError,
            hasPassword,
            formData,
            apiRoute,
            method
          )
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
                disabled={isSubmitting}
              />
              {errors[field.name] && (
                <p className="text-error">
                  {errors[field.name]?.message as ReactNode}
                </p>
              )}
            </div>
          )
        })}
        <Toggle
          text="show passwords"
          onChange={() => setShowPasswords(prev => !prev)}
        />
        <button className="btn btn-secondary" disabled={isSubmitting}>
          {isSubmitting ? (
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
