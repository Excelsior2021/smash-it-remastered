//components
import Input from "@/components/input/input"
import Toggle from "@/components/toggle/toggle"
import Modal from "@/components/modal/modal"
import LinkButton from "@/components/link-button/link-button"

//react
import { useState, type ReactNode } from "react"
import { useForm, type FieldValues } from "react-hook-form"

//next
import { useRouter } from "next/router"

//lib
import { authRedirect } from "@/lib/auth"
import clientRoute from "@/enums/client-route"
import { changePasswordFormFields } from "@/lib/form-fields"
import prisma from "@/lib/prisma"
import { resetPassword } from "@/lib/api"
import apiRoute from "@/enums/api-route"
import method from "@/enums/http-method"
import { makeRequest, showModal } from "@/lib/utils"

//next-auth
import { getServerSession } from "next-auth"
import { authOptions } from "../api/auth/[...nextauth]"

//types
import type {
  apiRouteType,
  makeRequestType,
  methodType,
  resetPasswordType,
  showModalType,
} from "@/types"
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
    formState: { errors, isSubmitting },
  } = useForm()
  const [showPasswords, setShowPasswords] = useState(false)
  const router = useRouter()

  let newPassword: string

  const handleResetPassword = async (
    makeRequest: makeRequestType,
    resetPassword: resetPasswordType,
    showModal: showModalType,
    formData: FieldValues,
    token: string,
    apiRoute: apiRouteType,
    method: methodType
  ) => {
    try {
      const res = await resetPassword(
        makeRequest,
        formData,
        token,
        apiRoute,
        method
      )
      if (res && res.ok) showModal()
    } catch (error) {
      console.log(error)
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
            handleResetPassword(
              makeRequest,
              resetPassword,
              showModal,
              formData,
              token,
              apiRoute,
              method
            )
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
