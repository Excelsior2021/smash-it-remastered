import Input from "@/src/components/input/input"
import { login } from "@/src/lib/api"
import { authRedirect } from "@/src/lib/auth"
import { loginFormFields } from "@/src/lib/form-fields"
import clientRoute from "@/src/lib/client-route"
import Link from "next/link"
import { useRouter } from "next/router"
import { useForm } from "react-hook-form"
import { getProviders, signIn } from "next-auth/react"
import { authOptions } from "../api/auth/[...nextauth]"
import { getServerSession } from "next-auth"
import OauthProviders from "@/src/components/oauth-providers/oauth-providers"
import { FieldValues } from "react-hook-form"
import { useState } from "react"
import Toggle from "@/src/components/toggle/toggle"

import type { clientRouteType } from "@/types"

const Login = ({ providers }) => {
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm()
  const router = useRouter()
  const [submitting, setSubmmiting] = useState(false)
  const [showPassword, setShowPassowrd] = useState(false)

  const handleLogin = async (
    signIn,
    formData: FieldValues,
    clientRoute: clientRouteType
  ) => {
    setSubmmiting(true)
    try {
      const res = await login(signIn, formData, clientRoute)
      if (!res.ok)
        setError("server", {
          message:
            "invalid credentials. please check your username/email and password",
        })
      else router.replace(clientRoute.root)
    } catch (error) {
    } finally {
      setSubmmiting(false)
    }
  }

  return (
    <div className="sm:flex sm:justify-center">
      <div className="sm:w-[500px]">
        <h1 className="text-3xl mb-10">Login to your account</h1>

        <OauthProviders providers={providers} signIn={signIn} />

        <form
          className="flex flex-col gap-8 mb-6"
          onSubmit={handleSubmit(
            async formData => await handleLogin(signIn, formData, clientRoute)
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
                  disabled={submitting}
                />
                {errors[field.name] ? (
                  <p className="text-error">{errors[field.name]?.message}</p>
                ) : null}
              </div>
            )
          })}
          {errors.server ? (
            <p className="text-error">{errors.server?.message}</p>
          ) : null}
          <Toggle
            text="show password"
            onChange={() => setShowPassowrd(prev => !prev)}
          />
          <button
            className="btn btn-secondary sm:w-1/2 sm:self-end"
            onClick={() => clearErrors()}
            disabled={submitting}>
            {submitting ? (
              <span className="loading loading-bars loading-sm"></span>
            ) : (
              "login"
            )}
          </button>
        </form>
        <Link
          className="block link text-center m-6"
          href={clientRoute.resetPassword}>
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
