import Input from "@/src/components/input/input"
import { login } from "@/src/lib/api"
import { authRedirect } from "@/src/lib/auth"
import { loginFormFields } from "@/src/lib/form-fields"
import clientRoute from "@/src/lib/client-route"
import Link from "next/link"
import { useRouter } from "next/router"
import { useForm } from "react-hook-form"
import { signIn } from "next-auth/react"

import { clientRoute as clientRouteType } from "@/types"

const Login = () => {
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm()
  const router = useRouter()

  const handleLogin = async (
    signIn,
    formData,
    clientRoute: clientRouteType
  ) => {
    const res = await login(signIn, formData, clientRoute)
    if (!res.ok)
      setError("server", {
        message:
          "invalid credentials. please check your username/email and password",
      })
    else router.replace(clientRoute.root)
  }

  return (
    <div className="sm:flex sm:justify-center">
      <div className="sm:w-[500px]">
        <h1 className="text-3xl mb-6">Login to your account</h1>
        <form
          className="flex flex-col gap-8 mb-6"
          onSubmit={handleSubmit(
            async formData => await handleLogin(signIn, formData, clientRoute)
          )}>
          {loginFormFields.map(field => (
            <div className="flex flex-col gap-1" key={field.name}>
              <Input
                {...field}
                className="input text-black"
                register={register}
                required={field.required}
              />
              {errors[field.name] ? (
                <p className="text-error">{errors[field.name]?.message}</p>
              ) : null}
            </div>
          ))}
          {errors.server ? (
            <p className="text-error">{errors.server?.message}</p>
          ) : null}
          <button
            className="btn btn-secondary sm:w-1/2 sm:self-end"
            onClick={() => clearErrors()}>
            login
          </button>
        </form>
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
  const session = await authRedirect(context)
  if (session) return session
  return {
    props: {},
  }
}
