//components
import LandingPage from "../components/pages/landing/landing"
import DashboardPage from "../components/pages/dashboard/dashboard"

//lib
import { protectedRoute } from "../lib/auth"
import clientRoute from "../enums/client-route"
import prisma from "../lib/prisma"

//next-auth
import { authOptions } from "./api/auth/[...nextauth]"
import { getServerSession } from "next-auth"

//types
import type { GetServerSidePropsContext } from "next"
import type { userGroup } from "@/types"

type props = {
  authenticated?: boolean
  session: any
  userGroups: userGroup[]
}

const Root = ({ authenticated, session, userGroups }: props) =>
  authenticated ? (
    <DashboardPage session={session} userGroups={userGroups} />
  ) : (
    <LandingPage />
  )

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const props = await protectedRoute(
    context,
    getServerSession,
    clientRoute,
    authOptions,
    clientRoute.root
  )
  const { authenticated, session } = props

  if (!authenticated) return props

  //remove undefined values from session object
  for (const key in session.user)
    if (session.user[key] === undefined) delete session.user[key]

  //fetch user groups
  const stats = await prisma.stat.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      group: {
        select: { id: true, name: true },
      },
    },
  })

  const userGroups = stats.map(stat => stat.group)

  return {
    props: {
      authenticated,
      session,
      userGroups,
    },
  }
}

export default Root
