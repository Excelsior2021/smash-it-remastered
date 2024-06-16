//components
import Modal from "@/src/components/modal/modal"
import Input from "@/src/components/input/input"
import Edit from "@/src/components/svg/edit"

//react
import { ReactNode, useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"

//next
import { useRouter } from "next/router"

//lib
import prisma from "@/src/lib/prisma"
import clientRoute from "@/src/lib/client-route"
import { protectedRoute } from "@/src/lib/auth"
import apiRoute from "@/src/lib/api-route"
import method from "@/src/lib/http-method"
import { changeAccountDetail } from "@/src/lib/api"

//store
import headerStore from "@/src/store/header"

//next-auth
import { getServerSession } from "next-auth"
import { authOptions } from "../api/auth/[...nextauth]"
import { useSession } from "next-auth/react"

//types
import type { apiRouteType, methodType } from "@/types"
import type { FieldValues } from "react-hook-form"
import type { GetServerSidePropsContext } from "next"

enum submissionStatus {
  pending,
  success,
  failed,
}

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
  onClick: (e: Event) => void
  onClickClose: () => void
}

const AccountDetails = ({ fields }: props) => {
  const { update } = useSession()
  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm()
  const [accountFieldsModalData, setAccountFieldsModalData] =
    useState<accountFieldsModalDataType | null>(null)
  const [submitting, setSubmmiting] = useState(false)
  const [submission, setSubmission] = useState(submissionStatus.pending)
  const [serverError, setServerError] = useState(false)
  const formRef = useRef(null)
  const router = useRouter()

  const setBackRoute = headerStore(state => state.setBackRoute)
  const clearBackRoute = headerStore(state => state.clearBackRoute)
  useEffect(() => {
    setBackRoute(clientRoute.account)
    return () => clearBackRoute()
  }, [setBackRoute, clearBackRoute])

  const handleChangeAccountDetail = async (
    formData: FieldValues,
    apiRoute: apiRouteType,
    method: methodType
  ) => {
    try {
      const res = await changeAccountDetail(formData, apiRoute, method)

      if (res && res.ok) {
        router.replace(router.asPath)
        const data = await res?.json()
        update({ [data.field]: data.value })
        setSubmission(submissionStatus.success)
      } else {
        const data = await res?.json()
        const errors = data.errors.filter((error: string) => error && error)
        setServerError(true)
        setError("server", {
          type: "server",
          message: errors,
        })
      }
    } catch (error) {
      console.log(error)
    } finally {
      setSubmmiting(false)
    }
  }

  return (
    <div className="max-w-[500px] m-auto">
      {accountFieldsModalData && (
        <Modal
          heading={accountFieldsModalData.heading}
          headingCapitalize={true}
          text={
            submission === submissionStatus.pending
              ? accountFieldsModalData.text
              : submissionStatus.success
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
          loading={submitting}
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
                          setSubmmiting(true)
                          await handleChangeAccountDetail(
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
                    onClick: (e: Event) => {
                      e.preventDefault()
                      formRef.current.requestSubmit()
                    },
                    onClickClose: () => {
                      setServerError(false)
                      clearErrors()
                      reset()
                      setSubmission(submissionStatus.pending)
                    },
                  })
                  document.getElementById("modal").showModal()
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
