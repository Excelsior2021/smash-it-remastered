//components
import FormSection from "@/components/form-section/form-section"
import OauthProviders from "@/components/oauth-providers/oauth-providers"
import Modal from "@/components/modal/modal"

//react
import { useState } from "react"
import { FieldValues, useForm } from "react-hook-form"

//next
import Link from "next/link"
import { useRouter } from "next/router"

//lib
import { createAccount } from "@/lib/api"
import { authRedirect } from "@/lib/auth"
import { accountFormFields, personalFormFields } from "@/lib/form-fields"
import clientRoute from "@/enums/client-route"
import apiRoute from "@/enums/api-route"
import method from "@/enums/http-method"
import { makeRequest, showModal } from "@/lib/utils"

//next-auth
import { authOptions } from "../api/auth/[...nextauth]"
import { getServerSession } from "next-auth"
import { getProviders, signIn } from "next-auth/react"

//types
import type {
  apiRouteType,
  apiRequestType,
  methodType,
  providers,
  showModalType,
} from "@/types"
import type { GetServerSidePropsContext } from "next"

type props = {
  providers: providers
}

const CreateAccount = ({ providers }: props) => {
  const {
    register,
    handleSubmit,
    trigger,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm()
  const [accountSection, setAccountSection] = useState(false)
  const router = useRouter()

  const handleCreateAccount = async (
    createAccount: apiRequestType,
    showModal: showModalType,
    formData: FieldValues,
    apiRoute: apiRouteType,
    method: methodType
  ) => {
    try {
      const res: Awaited<Response> = await createAccount(
        makeRequest,
        formData,
        apiRoute,
        method
      )

      if (res.ok) showModal()
      else {
        const serverErrors = await res.json()

        if (res.status === 500) {
          setError("server", {
            type: "server",
            message: serverErrors.error,
          })
          return
        }

        for (const error in serverErrors.errors) {
          serverErrors.errors[error] = serverErrors.errors[error].filter(
            (error: string | boolean) => error && error
          )
          if (serverErrors.errors[error].length > 0)
            setError(error, {
              type: "server",
              message: serverErrors.errors[error],
            })
        }
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="sm:flex justify-center">
      <div className="sm:w-[500px]">
        <h1 className="text-3xl mb-6">Create an account</h1>

        <OauthProviders providers={providers} signIn={signIn} />

        <form
          className="flex flex-col gap-6 mb-6"
          onSubmit={handleSubmit(async formData =>
            handleCreateAccount(
              createAccount,
              showModal,
              formData,
              apiRoute,
              method
            )
          )}>
          <fieldset
            className={`${accountSection ? "hidden" : null}`}
            disabled={isSubmitting}>
            <FormSection
              heading="personal details"
              fields={personalFormFields}
              register={register}
              errors={errors}
              clearErrors={clearErrors}
            />
          </fieldset>

          <fieldset
            className={`${accountSection ? null : "hidden"}`}
            disabled={isSubmitting}>
            <FormSection
              heading="account details"
              fields={accountFormFields}
              register={register}
              errors={errors}
              clearErrors={clearErrors}
              toggle={true}
            />
          </fieldset>

          {!accountSection && (
            <button
              className="btn btn-secondary sm:w-1/2 sm:self-end"
              onClick={async () => {
                if (await trigger("email")) setAccountSection(true)
              }}
              type="button">
              next
            </button>
          )}

          {accountSection && (
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
              <button
                className="btn btn-secondary sm:w-[48%]"
                onClick={() => setAccountSection(false)}
                disabled={isSubmitting}>
                back
              </button>
              <button
                className="btn btn-secondary sm:w-[48%]"
                disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="loading loading-bars loading-sm"></span>
                ) : (
                  "create account"
                )}
              </button>
            </div>
          )}
        </form>
        <p className="text-center">
          Already have an account? Login{" "}
          <Link className="link" href={clientRoute.login}>
            here
          </Link>
        </p>
      </div>
      <Modal
        heading="account created"
        text="A verification email has been sent to your email address. Please verify your email."
        onClickClose={() => router.replace(clientRoute.login)}
      />
    </div>
  )
}

export default CreateAccount

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

  const providers = await getProviders()

  return {
    props: {
      providers,
    },
  }
}
