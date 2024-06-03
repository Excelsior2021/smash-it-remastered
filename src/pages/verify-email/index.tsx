import LinkButton from "@/src/components/link-button/link-button"
import clientRoute from "@/src/lib/client-route"
import prisma from "@/src/lib/prisma"

type props = {
  message: string
  login: boolean
}

const VerifyEmail = ({ message, login }: props) => {
  return (
    <div>
      <p className="text-2xl text-center">{message}</p>

      <div className="max-w-[300px] m-auto my-20">
        <LinkButton href={clientRoute.login} text="login" />
      </div>
    </div>
  )
}

export default VerifyEmail

export const getServerSideProps = async context => {
  const { token } = context.query

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
        message: "Invalid Token",
      },
    }

  if (verificationToken.expires < new Date())
    return {
      props: {
        message: "Token expired. Please log in and generate a new token.",
        login: true,
      },
    }

  const [deleteToken, updateUser] = await prisma.$transaction([
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
    }),
  ])

  console.log(deleteToken, updateUser)

  return {
    props: {
      message: "Email Verified",
      login: true,
    },
  }
}
