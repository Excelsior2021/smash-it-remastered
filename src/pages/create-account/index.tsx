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

const CreateAccount = () => {
  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm()
  const [accountSection, setAccountSection] = useState(false)
  const router = useRouter()
  const createAccountStore = createAccountFormStore()

  const handleCreateAccount = async (createAccountStore, router) => {
    const res = await createAccount(createAccountStore)
    if (res.ok) {
      router.replace("/")
      createAccountStore.clearState()
    }
  }

  return (
    <div className="p-4 sm:flex justify-center">
      <div className="sm:w-[500px]">
        <h1 className="text-3xl mb-6">Create an account</h1>
        <form
          className="flex flex-col gap-6 mb-6"
          onSubmit={handleSubmit(() =>
            handleCreateAccount(createAccountStore, router)
          )}>
          {!accountSection && (
            <FormSection
              heading="personal details"
              fields={personalFormFields}
              register={register}
              createAccountStore={createAccountStore}
              errors={errors}
            />
          )}
          {accountSection && (
            <FormSection
              heading="account details"
              fields={accountFormFields}
              register={register}
              createAccountStore={createAccountStore}
              errors={errors}
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
                onClick={() => setAccountSection(false)}>
                back
              </button>
              <button className="btn btn-secondary sm:w-[48%]">
                create account
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
  const session = await authRedirect(context)
  if (session) return session

  return {
    props: {},
  }
}
