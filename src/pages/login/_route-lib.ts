import type { FieldValues, UseFormSetError } from "react-hook-form"
import type { NextRouter } from "next/router"
import type { clientRouteType, loginRequestType, signInNextAuth } from "@/types"

export const handleLogin = async (
  signIn: signInNextAuth,
  login: loginRequestType,
  formData: FieldValues,
  setError: UseFormSetError<FieldValues>,
  router: NextRouter,
  clientRoute: clientRouteType
) => {
  try {
    const res = await login(signIn, formData, clientRoute)

    if (!res.ok) {
      setError("server", {
        message:
          res.error === "CredentialsSignin"
            ? "invalid credentials. please check your username/email and password"
            : res.error,
      })
    } else router.replace(clientRoute.root)
  } catch (error) {
    console.log(error)
  }
}
