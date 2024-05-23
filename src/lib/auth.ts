import { getServerSession } from "next-auth"
import { authOptions } from "../pages/api/auth/[...nextauth]"
import { compare, hash } from "bcryptjs"
import routes from "./client-routes"

export const hashPassword = async (password: string) => await hash(password, 12)

export const verifyPassword = async (
  password: string,
  hashedPassword: string
) => await compare(password, hashedPassword)

export const protectedRoute = async ({ req, res }, route = "") => {
  const session = await getServerSession(req, res, authOptions)

  if (!session) {
    if (route === routes.root)
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
        redirect: { destination: routes.login, permanent: false },
      }
  }

  return { authenticated: true, session }
}

export const adminRoute = async (context, session, prisma) => {
  try {
    const stat = await prisma.stat.findUnique({
      where: {
        userId_groupId: {
          userId: session.user.id,
          groupId: parseInt(context.query.groupId),
        },
      },
      select: {
        isAdmin: true,
      },
    })

    return stat?.isAdmin
  } catch (error) {
    console.log(error)
  }
}

export const notAdmin = (routes, context) => ({
  redirect: {
    destination: `${routes.group}/${context.query.groupId}`,
    permanent: false,
  },
})

export const authRedirect = async ({ req, res }) => {
  const session = await getServerSession(req, res, authOptions)

  if (session)
    return {
      redirect: { destination: routes.root, permanent: false },
    }
}
