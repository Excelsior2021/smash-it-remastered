//components
import Modal from "@/src/components/modal/modal"

//react
import { useState } from "react"

//next
import { useRouter } from "next/router"

//lib
import { protectedRoute } from "@/src/lib/auth"
import clientRoute from "@/src/lib/client-route"
import { verifyEmail } from "@/src/lib/api"
import apiRoute from "@/src/lib/api-route"
import method from "@/src/lib/http-method"

//next-auth
import { getServerSession } from "next-auth"
import { authOptions } from "../api/auth/[...nextauth]"

//types
import type { GetServerSidePropsContext } from "next"
import type { noBodyApiType } from "@/types"

const EmailVerification = () => {
  const [error, setError] = useState(null)
  const router = useRouter()

  const handleVerifyEmail = async (verifyEmail: noBodyApiType) => {
    const res = await verifyEmail(apiRoute, method)

    if (res && !res.ok) {
      const data = await res.json()
      setError(data.error)
    }

    if (res && res.ok) document.getElementById("modal").showModal()
  }

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
        onClick={() => handleVerifyEmail(verifyEmail)}>
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
