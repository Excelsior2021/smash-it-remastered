//components
import Modal from "@/components/modal/modal"

//react
import { useState } from "react"

//next
import { useRouter } from "next/router"

//lib
import { handleVerifyEmail } from "./route-lib"
import { protectedRoute } from "@/lib/auth"
import { clientRoute } from "@/enums"
import { verifyEmail } from "@/lib/api"
import { apiRoute } from "@/enums"
import { makeRequest, showModal } from "@/lib/utils"

//next-auth
import { getServerSession } from "next-auth"
import { authOptions } from "../api/auth/[...nextauth]"

//types
import type { GetServerSidePropsContext } from "next"

const EmailVerification = () => {
  const [error, setError] = useState(null)
  const router = useRouter()

  return (
    <div>
      <Modal
        heading="email verification email sent"
        text="please check your email for the verification link."
        onClickClose={() => router.replace(clientRoute.account)}
      />
      <h1 className="text-3xl capitalize text-center mb-6">verify email</h1>
      <p className="text-xl text-center">
        Click the button below to send a new verification email
      </p>
      <button
        className="btn btn-secondary text-lg capitalize block m-auto mt-16"
        onClick={() =>
          handleVerifyEmail(
            makeRequest,
            verifyEmail,
            showModal,
            setError,
            apiRoute
          )
        }>
        verify email
      </button>
      {error && <p className="text-error text-center my-6">{error}</p>}
    </div>
  )
}

export default EmailVerification

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

  if (session.user.emailVerified)
    return {
      redirect: {
        destination: clientRoute.root,
        permanent: false,
      },
    }

  return {
    props: {},
  }
}
