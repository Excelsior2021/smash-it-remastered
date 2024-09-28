//components
import Input from "@/components/input/input"
import Toggle from "@/components/toggle/toggle"
import OauthProviders from "@/components/oauth-providers/oauth-providers"
import ServerDown from "@/components/server-down/server-down"

//react
import { useState, type ReactNode } from "react"
import { useForm } from "react-hook-form"

//next
import Link from "next/link"
import { useRouter } from "next/router"

//lib
import { handleLogin } from "@/lib/route-libs/login"
import { login } from "@/lib/api"
import { authRedirect } from "@/lib/auth"
import { loginFormFields } from "@/lib/form-fields"
import { clientRoute } from "@/enums"

//next-auth
import { getProviders, signIn } from "next-auth/react"
import { authOptions } from "../api/auth/[...nextauth]"
import { getServerSession } from "next-auth"

//types
import type { providers } from "@/types"
import type { GetServerSidePropsContext } from "next"

type props = {
  providers: providers
}

const Login = ({ providers }: props) => {
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm()
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="sm:flex sm:justify-center">
      <div className="sm:w-[500px]">
        <ServerDown />
        <h1 className="text-3xl mb-10">Login to your account</h1>

        <OauthProviders providers={providers} signIn={signIn} />

        <form
          className="flex flex-col gap-8 mb-6"
          onSubmit={handleSubmit(
            async formData =>
              await handleLogin(
                signIn,
                login,
                formData,
                setError,
                router,
                clientRoute
              )
          )}>
          {loginFormFields.map(field => {
            if (field.name === "password")
              field.type = showPassword ? "text" : "password"
            return (
              <div className="flex flex-col gap-1" key={field.name}>
                <Input
                  {...field}
                  className="input text-black w-full"
                  register={register}
                  required={field.required}
                  //if server is down disabled = true, else, isSubmitting
                  disabled={false}
                />
                {errors[field.name] ? (
                  <p className="text-error">
                    {errors[field.name]?.message as ReactNode}
                  </p>
                ) : null}
              </div>
            )
          })}
          {errors.server ? (
            <p className="text-error">{errors.server?.message as ReactNode}</p>
          ) : null}
          <Toggle
            text="show password"
            onChange={() => setShowPassword(prev => !prev)}
          />
          <button
            className="btn btn-secondary sm:w-1/2 sm:self-end"
            onClick={() => clearErrors()}
            disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="loading loading-bars loading-sm"></span>
            ) : (
              "login"
            )}
          </button>
        </form>
        <Link
          className="block link text-center m-6"
          href={clientRoute.forgottenPassword}>
          Forgot password?
        </Link>
        <p className="text-center">
          Create an account{" "}
          <Link className="link" href={clientRoute.createAccount}>
            here
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login

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
