//components
import LinkButton from "@/src/components/link-button/link-button"

//react
import { useEffect } from "react"

//lib
import { protectedRoute } from "@/src/lib/auth"
import clientRoute from "@/src/lib/client-route"

//store
import navStore from "@/src/store/nav"

//next-auth
import { signOut } from "next-auth/react"
import { authOptions } from "../api/auth/[...nextauth]"
import { getServerSession } from "next-auth"

//types
import type { GetServerSidePropsContext } from "next"

type props = {
  emailVerified: boolean
}

const AccountPage = ({ emailVerified }: props) => {
  const setActiveNavItem = navStore(state => state.setActiveNavItem)

  const accountLinks = [
    { key: 1, href: clientRoute.accountDetails, text: "account details" },
    { key: 2, href: clientRoute.changePassword, text: "change password" },
    { key: 3, href: clientRoute.emailVerification, text: "verify email" },
    { key: 4, href: clientRoute.deleteAccount, text: "delete account" },
  ]

  useEffect(() => {
    setActiveNavItem("account")
    return () => setActiveNavItem(null)
  }, [setActiveNavItem])

  return (
    <div className="relative">
      <h1 className="text-3xl text-center capitalize mb-6">my account</h1>
      <ul className="flex flex-col items-center gap-8 max-w-96 m-auto">
        {accountLinks.map(link => {
          if (emailVerified && link.key === 3) return
          return (
            <li className="w-full" key={link.key}>
              <LinkButton href={link.href} text={link.text} />
            </li>
          )
        })}
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

  return {
    props: {
      emailVerified: session.user.emailVerified ? true : false,
    },
  }
}
