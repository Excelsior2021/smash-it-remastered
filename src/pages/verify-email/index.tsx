//components
import LinkButton from "@/components/link-button/link-button"
import Modal from "@/components/modal/modal"

//react
import { useEffect } from "react"

//next
import { useRouter } from "next/router"

//lib
import clientRoute from "@/enums/client-route"
import prisma from "@/lib/prisma"
import { showModal } from "@/lib/utils"

//next-auth
import { getServerSession } from "next-auth"
import { authOptions } from "../api/auth/[...nextauth]"
import { useSession } from "next-auth/react"

//types
import type { GetServerSidePropsContext } from "next"

type props = {
  message: string
  loggedIn: true
  emailVerified: string
}

const VerifyEmail = ({ message, loggedIn, emailVerified }: props) => {
  const { update } = useSession()
  const router = useRouter()

  useEffect(() => {
    showModal()
  }, [])

  return (
    <div>
      <Modal
        heading={message}
        onClickClose={() => {
          update({ emailVerified })
          router.replace(clientRoute.root)
        }}
      />

      {!loggedIn && (
        <div className="max-w-[300px] m-auto my-20">
          <LinkButton href={clientRoute.login} text="login" />
        </div>
      )}
    </div>
  )
}

export default VerifyEmail

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const token = context.query.token as string

  if (!token) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    }
  }

  const session = await getServerSession(context.req, context.res, authOptions)

  if (session && session.user.emailVerified)
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    }

  const verificationToken = await prisma.emailVerification.findUnique({
    where: {
      token,
    },
    include: {
      user: {
        select: {
          id: true,
        },
      },
    },
  })

  if (!verificationToken)
    return {
      props: {
        message: session
          ? "Invalid Token. Please generate a new token."
          : "Invalid Token. Please login and generate a new token.",
        loggedIn: session && true,
      },
    }

  if (verificationToken.expires < new Date())
    return {
      props: {
        message: session
          ? "Token expired. Please generate a new token."
          : "Token expired. Please login and generate a new token.",
        loggedIn: session && true,
      },
    }

  const [_, user] = await prisma.$transaction([
    prisma.emailVerification.delete({
      where: {
        token,
      },
    }),
    prisma.user.update({
      where: {
        id: verificationToken.user.id,
      },
      data: {
        emailVerified: new Date(),
      },
      select: {
        emailVerified: true,
      },
    }),
  ])

  if (user.emailVerified)
    return {
      props: {
        message: "Email Verified",
        loggedIn: session && true,
        emailVerified: JSON.stringify(user.emailVerified),
      },
    }
}
