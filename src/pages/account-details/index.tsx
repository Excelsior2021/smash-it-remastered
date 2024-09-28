//components
import Modal from "@/components/modal/modal"
import Input from "@/components/input/input"
import Edit from "@/components/svg/edit"

//react
import { useEffect, useRef, useState, type ReactNode } from "react"
import { useForm } from "react-hook-form"

//next
import { useRouter } from "next/router"

//lib
import {
  accountDetailsEffect,
  handleChangeAccountDetail,
  submissionStatus,
} from "@/lib/route-libs/account-details"
import prisma from "@/lib/prisma"
import { clientRoute } from "@/enums"
import { protectedRoute } from "@/lib/auth"
import { apiRoute } from "@/enums"
import { method } from "@/enums"
import { changeAccountDetail } from "@/lib/api"
import { makeRequest, showModal } from "@/lib/utils"

//store
import headerStore from "@/store/header"

//next-auth
import { getServerSession } from "next-auth"
import { authOptions } from "../api/auth/[...nextauth]"
import { useSession } from "next-auth/react"

//types
import type { GetServerSidePropsContext } from "next"
import type { MouseEventHandler } from "react"

type props = {
  fields: {
    label: string
    name: string
    type: string
    value: string
    text: string
  }[]
}

type accountFieldsModalDataType = {
  heading: string
  text: string
  input: ReactNode
  onClick: MouseEventHandler<HTMLButtonElement> | undefined
  onClickClose: MouseEventHandler<HTMLButtonElement> | undefined
}

const AccountDetails = ({ fields }: props) => {
  const { update } = useSession()
  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm()
  const [accountFieldsModalData, setAccountFieldsModalData] =
    useState<accountFieldsModalDataType | null>(null)
  const [submission, setSubmission] = useState(submissionStatus.pending)
  const [serverError, setServerError] = useState(false)
  const formRef = useRef(null)
  const router = useRouter()
  const setBackRoute = headerStore(state => state.setBackRoute)
  const clearBackRoute = headerStore(state => state.clearBackRoute)

  useEffect(
    () => accountDetailsEffect(setBackRoute, clearBackRoute, clientRoute),
    [setBackRoute, clearBackRoute]
  )

  return (
    <div className="max-w-[500px] m-auto">
      {accountFieldsModalData && (
        <Modal
          heading={accountFieldsModalData.heading}
          headingCapitalize={true}
          text={
            submission === submissionStatus.pending
              ? accountFieldsModalData.text
              : submission === submissionStatus.success
              ? "updated successfully"
              : null
          }
          accountFieldInput={
            submission === submissionStatus.pending
              ? accountFieldsModalData.input
              : null
          }
          errors={serverError ? errors : null}
          action={submission === submissionStatus.pending ? "submit" : null}
          loading={isSubmitting}
          onClick={accountFieldsModalData.onClick}
          onClickClose={accountFieldsModalData.onClickClose}
        />
      )}

      <h1 className="text-3xl text-center capitalize mb-6">account details</h1>
      <ul className="flex flex-col gap-8">
        {fields.map(field => (
          <li key={field.name} className="flex flex-col gap-1">
            <div className="flex justify-between items-center border-b pb-1">
              <span className="text-xl capitalize">{field.label}</span>
              <div
                className="cursor-pointer"
                onClick={() => {
                  setAccountFieldsModalData({
                    heading: `new ${field.label}`,
                    text: field.text,
                    input: (
                      <form
                        onSubmit={handleSubmit(async formData => {
                          await handleChangeAccountDetail(
                            makeRequest,
                            changeAccountDetail,
                            update,
                            setSubmission,
                            setServerError,
                            setError,
                            router,
                            formData,
                            apiRoute,
                            method
                          )
                        })}
                        ref={formRef}>
                        <Input
                          label={`new ${field.label}`}
                          name={field.name}
                          type={field.type}
                          className="input text-black w-full my-4"
                          register={register}
                          onChange={() => {
                            setServerError(false)
                            clearErrors()
                          }}
                        />
                      </form>
                    ),
                    onClick: e => {
                      e.preventDefault()
                      if (formRef.current) formRef.current.requestSubmit()
                    },
                    onClickClose: () => {
                      setServerError(false)
                      clearErrors()
                      reset()
                      setSubmission(submissionStatus.pending)
                    },
                  })
                  setTimeout(() => showModal())
                }}>
                <Edit className="size-8" />
              </div>
            </div>
            <span>{field.value ? field.value : "(not set)"}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default AccountDetails

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

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      email: true,
      username: true,
      firstName: true,
      lastName: true,
    },
  })

  if (user) {
    const fields = [
      {
        label: "email",
        name: "email",
        type: "email",
        value: user.email,
        text: `Enter your new email address below. When you submit, 
        a verification email should be 
        sent to your new email address. 
        Verify the email address to complete the change`,
      },
      {
        label: "username",
        name: "username",
        type: "text",
        value: user.username,
        text: `Enter your new username below`,
      },
      {
        label: "first name",
        name: "firstName",
        type: "text",
        value: user.firstName,
        text: `Enter the your new name below`,
      },
      {
        label: "last name",
        name: "lastName",
        type: "text",
        value: user.lastName,
        text: `Enter the your new name below`,
      },
    ]
    return {
      props: {
        fields,
      },
    }
  }

  return {
    notFound: true,
  }
}
