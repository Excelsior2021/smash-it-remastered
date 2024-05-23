import LandingPage from "./landing/landing"
import DashboardPage from "./dashboard/dashboard"
import { protectedRoute } from "../lib/auth"
import routes from "../lib/client-routes"

type props = {
  authenticated: boolean | undefined
  session: any
}

const Root = ({ authenticated, session }: props) =>
  authenticated ? <DashboardPage session={session} /> : <LandingPage />

export const getServerSideProps = async (context: any) => {
  const props = await protectedRoute(context, routes.root)
  const { authenticated, session } = props

  if (!authenticated) return props

  return {
    props: {
      authenticated,
      session,
    },
  }
}

export default Root
