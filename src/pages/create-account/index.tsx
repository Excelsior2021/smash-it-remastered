import FormSection from "@/src/components/form-section/form-section"
import { createAccount } from "@/src/lib/api"
import { authRedirect } from "@/src/lib/auth"
import { accountFormFields, personalFormFields } from "@/src/lib/form-fields"
import clientRoute from "@/src/lib/client-route"
import createAccountFormStore from "@/src/store/create-account"
import Link from "next/link"
import { useRouter } from "next/router"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { authOptions } from "../api/auth/[...nextauth]"
import { getServerSession } from "next-auth"
import OauthProviders from "@/src/components/oauth-providers/oauth-providers"
import { getProviders, signIn } from "next-auth/react"
import apiRoute from "@/src/lib/api-route"
import method from "../../lib/http-method"

import type { NextRouter } from "next/router"
import type { apiRouteType, methodType } from "@/types"

const CreateAccount = ({ providers }) => {
  const {
    register,
    handleSubmit,
    trigger,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm()
  const [accountSection, setAccountSection] = useState(false)
  const [submitting, setSubmmiting] = useState(false)
  const router = useRouter()
  const createAccountStore = createAccountFormStore()

  const handleCreateAccount = async (
    createAccountStore,
    router: NextRouter,
    apiRoute: apiRouteType,
    method: methodType
  ) => {
    try {
      setSubmmiting(true)
      const res = (await createAccount(
        createAccountStore,
        apiRoute,
        method
      )) as Response

      if (res.ok) {
        router.replace("/")
        createAccountStore.clearState()
        return
      } else {
        const serverErrors = await res.json()

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
    } finally {
      setSubmmiting(false)
    }
  }

  return (
    <div className="p-4 sm:flex justify-center">
      <div className="sm:w-[500px]">
        <h1 className="text-3xl mb-6">Create an account</h1>

        <OauthProviders providers={providers} signIn={signIn} />

        <form
          className="flex flex-col gap-6 mb-6"
          onSubmit={handleSubmit(() =>
            handleCreateAccount(createAccountStore, router, apiRoute, method)
          )}>
          {!accountSection && (
            <FormSection
              heading="personal details"
              fields={personalFormFields}
              register={register}
              createAccountStore={createAccountStore}
              errors={errors}
              clearErrors={clearErrors}
              disabled={submitting}
            />
          )}
          {accountSection && (
            <FormSection
              heading="account details"
              fields={accountFormFields}
              register={register}
              createAccountStore={createAccountStore}
              errors={errors}
              clearErrors={clearErrors}
              disabled={submitting}
              toggle={true}
            />
          )}
          {!accountSection && (
            <button
              className="btn btn-secondary sm:w-1/2 sm:self-end"
              onClick={async () => {
                if (await trigger()) setAccountSection(true)
              }}>
              next
            </button>
          )}
          {accountSection && (
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
              <button
                className="btn btn-secondary sm:w-[48%]"
                onClick={() => setAccountSection(false)}
                disabled={submitting}>
                back
              </button>
              <button
                className="btn btn-secondary sm:w-[48%]"
                disabled={submitting}>
                {submitting ? (
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
    </div>
  )
}

export default CreateAccount

export const getServerSideProps = async context => {
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
