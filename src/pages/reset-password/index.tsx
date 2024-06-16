//components
import Input from "@/src/components/input/input"
import Toggle from "@/src/components/toggle/toggle"
import Modal from "@/src/components/modal/modal"
import LinkButton from "@/src/components/link-button/link-button"

//react
import { useState } from "react"
import { useForm } from "react-hook-form"

//next
import { useRouter } from "next/router"

//lib
import { authRedirect } from "@/src/lib/auth"
import clientRoute from "@/src/lib/client-route"
import { changePasswordFormFields } from "@/src/lib/form-fields"
import prisma from "@/src/lib/prisma"
import { resetPassword } from "@/src/lib/api"
import apiRoute from "@/src/lib/api-route"
import method from "@/src/lib/http-method"

//next-auth
import { getServerSession } from "next-auth"
import { authOptions } from "../api/auth/[...nextauth]"

//types
import type { FieldValues } from "react-hook-form"
import type { apiRouteType, methodType } from "@/types"
import type { GetServerSidePropsContext } from "next"

type props = {
  token: string
  invalid: string
}

const ResetPassword = ({ token, invalid }: props) => {
  const {
    register,
    handleSubmit,
    watch,
    clearErrors,
    formState: { errors },
  } = useForm()
  const [submitting, setSubmitting] = useState(false)
  const [showPasswords, setShowPasswords] = useState(false)
  const router = useRouter()

  let newPassword: string

  const handleResetPassword = async (
    formData: FieldValues,
    token: string,
    apiRoute: apiRouteType,
    method: methodType
  ) => {
    setSubmitting(true)
    try {
      const res = await resetPassword(formData, token, apiRoute, method)
      if (res && res.ok) document.getElementById("modal").showModal()
    } catch (error) {
      console.log(error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <h1 className="text-3xl text-center capitalize mb-10">reset password</h1>

      {invalid && (
        <div className="w-96 m-auto">
          <p className="text-2xl text-center mb-10">{invalid}</p>
          <LinkButton href={clientRoute.login} text="login" />
        </div>
      )}

      {!invalid && (
        <form
          className="flex flex-col gap-10 max-w-[500px] m-auto"
          onSubmit={handleSubmit(async formData =>
            handleResetPassword(formData, token, apiRoute, method)
          )}>
          {changePasswordFormFields.map(field => {
            if (field.name === "currentPassword") return
            if (field.name === "newPassword") newPassword = watch(field.name)
            return (
              <div className="flex flex-col gap-2" key={field.name}>
                <Input
                  label={field.label}
                  name={field.name}
                  type={showPasswords ? "text" : field.type}
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
            ) : (
              "submit"
            )}
          </button>
        </form>
      )}
      <Modal
        heading="Your password has been reset"
        onClickClose={() => router.replace(clientRoute.login)}
      />
    </div>
  )
}

export default ResetPassword

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

  const token = context.query.token as string

  if (!token) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    }
  }

  const resetPasswordToken = await prisma.resetPassword.findUnique({
    where: {
      token,
    },
    include: {
      user: {
        select: {
          id: true,
        },
      },
    },
  })

  if (!resetPasswordToken)
    return {
      props: {
        invalid: "Invalid Token",
      },
    }

  if (resetPasswordToken.expires < new Date())
    return {
      props: {
        invalid: "Token expired",
      },
    }

  return {
    props: {
      token,
    },
  }
}
