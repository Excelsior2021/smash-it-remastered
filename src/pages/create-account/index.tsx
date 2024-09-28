//components
import FormSection from "@/components/form-section/form-section"
import OauthProviders from "@/components/oauth-providers/oauth-providers"
import Modal from "@/components/modal/modal"
import ServerDown from "@/components/server-down/server-down"

//react
import { useState } from "react"
import { useForm } from "react-hook-form"

//next
import Link from "next/link"
import { useRouter } from "next/router"

//lib
import { handleCreateAccount } from "./_route-lib"
import { createAccount } from "@/lib/api"
import { authRedirect } from "@/lib/auth"
import { accountFormFields, personalFormFields } from "@/lib/form-fields"
import { clientRoute } from "@/enums"
import { apiRoute } from "@/enums"
import { method } from "@/enums"
import { makeRequest, showModal } from "@/lib/utils"

//next-auth
import { authOptions } from "../api/auth/[...nextauth]"
import { getServerSession } from "next-auth"
import { getProviders, signIn } from "next-auth/react"

//types
import type { providers } from "@/types"
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

  return (
    <div className="sm:flex justify-center">
      <div className="sm:w-[500px]">
        <ServerDown />
        <h1 className="text-3xl mb-6">Create an account</h1>

        <OauthProviders providers={providers} signIn={signIn} />

        <form
          className="flex flex-col gap-6 mb-6"
          onSubmit={handleSubmit(async formData =>
            handleCreateAccount(
              createAccount,
              makeRequest,
              showModal,
              setError,
              formData,
              apiRoute,
              method
            )
          )}>
          <fieldset
            className={`${accountSection ? "hidden" : null}`}
            //if server is down disabled = true, else, isSubmitting
            disabled={true}>
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
            //if server is down disabled = true, else, isSubmitting
            disabled={true}>
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
