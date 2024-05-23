import LinkButton from "@/src/components/link-button/link-button"
import { protectedRoute } from "@/src/lib/auth"
import routes from "@/src/lib/client-routes"
import navStore from "@/src/store/nav"
import { signOut } from "next-auth/react"
import { useEffect } from "react"

const AccountPage = () => {
  const setActiveNavItem = navStore(state => state.setActiveNavItem)

  useEffect(() => {
    setActiveNavItem("account")
    return () => setActiveNavItem(null)
  }, [setActiveNavItem])

  return (
    <div className="relative">
      <h1 className="text-3xl text-center capitalize mb-6">my account</h1>
      <ul className="flex flex-col items-center gap-8 max-w-96 m-auto">
        <li className="w-full">
          <LinkButton href="#" text="personal details" />
        </li>
        <li className="w-full">
          <LinkButton href="#" text="change password" />
        </li>
        <li className="w-full">
          <LinkButton href={routes.deleteAccount} text="delete account" />
        </li>
      </ul>

      <button
        className="btn btn-secondary block w-full max-w-96 m-auto mt-20 "
        onClick={async () => await signOut()}>
        logout
      </button>
    </div>
  )
}

export default AccountPage

export const getServerSideProps = async context => {
  const props = await protectedRoute(context)
  const { authenticated, session } = props

  if (!authenticated) return props

  return {
    props: {
      authenticated,
      session,
    },
  }
}
