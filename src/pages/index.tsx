import LandingPage from "../components/pages/landing/landing"
import DashboardPage from "../components/pages/dashboard/dashboard"
import { protectedRoute } from "../lib/auth"
import clientRoute from "../lib/client-route"
import { authOptions } from "./api/auth/[...nextauth]"
import { getServerSession } from "next-auth"

type props = {
  authenticated: boolean | undefined
  session: any
}

const Root = ({ authenticated, session }: props) =>
  authenticated ? <DashboardPage session={session} /> : <LandingPage />

export const getServerSideProps = async (context: any) => {
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

  return {
    props: {
      authenticated,
      session,
    },
  }
}

export default Root
