import type {
  clientRouteType,
  getServerSession,
  hashBcrypt,
  txPrisma,
  uuidType,
} from "@/types"
import type { PrismaClient } from "@prisma/client"
import type { GetServerSidePropsContext } from "next"
import type { ErrorResponse, Resend } from "resend"

export const hashPassword = async (
  password: string,
  hash: hashBcrypt,
  salt = 12
) => await hash(password, salt)

export const protectedRoute = async (
  context: GetServerSidePropsContext,
  getServerSession: getServerSession,
  clientRoute: clientRouteType,
  authOptions,
  route = ""
) => {
  const session = await getServerSession(context.req, context.res, authOptions)

  if (!session) {
    if (route === clientRoute.root)
      return {
        props: {
          authenticated: false,
        },
      }
    else
      return {
        props: {
          authenticated: false,
        },
        redirect: { destination: clientRoute.login, permanent: false },
      }
  }

  return { authenticated: true, session }
}

export const adminRoute = async (
  context: GetServerSidePropsContext,
  session: any,
  prisma: PrismaClient
) => {
  const stat = await prisma.stat.findUnique({
    where: {
      userId_groupId: {
        userId: session.user.id,
        groupId: parseInt(context.query.groupId as string),
      },
    },
    select: {
      isAdmin: true,
    },
  })

  return stat?.isAdmin === true
}

export const notAdmin = (
  context: GetServerSidePropsContext,
  clientRoute: clientRouteType
) => ({
  redirect: {
    destination: `${clientRoute.group}/${context.query.groupId}`,
    permanent: false,
  },
})

export const authRedirect = async (
  context: GetServerSidePropsContext,
  getServerSession: getServerSession,
  clientRoute: clientRouteType,
  authOptions
) => {
  const session = await getServerSession(context.req, context.res, authOptions)

  if (session)
    return {
      redirect: { destination: clientRoute.root, permanent: false },
    }
}

export const getToken = async (email: string, tx: txPrisma, type: string) => {
  try {
    const token = await tx[type].findUnique({
      where: {
        email,
      },
    })
    return token
  } catch (error) {
    console.log(error)
  }
}

export const generateToken = async (
  email: string,
  uuid: uuidType,
  tx: txPrisma,
  type: string
) => {
  const token = uuid()
  const expire = new Date().getTime() + 1000 * 60 * 60 * 24

  const existingToken = await getToken(email, tx, type)

  if (existingToken)
    await tx[type].delete({
      where: {
        email,
      },
    })

  const newToken = await tx[type].create({
    data: {
      email,
      token,
      expires: new Date(expire),
    },
  })

  return newToken
}

export const sendEmailVerificationToken = async (
  email: string,
  token: string,
  username: string,
  resend: Resend
) => {
  try {
    const confirmationLink = `${process.env.CLIENT_DOMAIN}/verify-email?token=${token}`

    const { data, error } = await resend.emails.send({
      from: "Smash It! <info@smash-it-table-tennis.com>",
      to: email,
      subject: "Please verify your email",
      text: confirmationLink,
      html: `  <div>
      <h1>Hi, ${username}!</h1>

      <p>Please verify your email with the link below.</p>

      <a href=${confirmationLink}>${confirmationLink}</a>
    </div>`,
    })

    if (error) throw new Error(error.message)

    return data
  } catch (error) {
    return error as ErrorResponse
  }
}

export const sendResetPasswordToken = async (
  email: string,
  token: string,
  username: string,
  resend: Resend
) => {
  try {
    const resetPasswordLink = `${process.env.CLIENT_DOMAIN}/reset-password?token=${token}`

    const { data, error } = await resend.emails.send({
      from: "Smash It! <info@smash-it-table-tennis.com>",
      to: email,
      subject: "Reset your password",
      text: resetPasswordLink,
      html: `  <div>
      <h1>Hi, ${username}!</h1>

      <p>Reset your password with the link below.</p>

      <a href=${resetPasswordLink}>${resetPasswordLink}</a>
    </div>`,
    })

    if (error) throw new Error(error)

    return data
  } catch (error) {
    return error
  }
}
