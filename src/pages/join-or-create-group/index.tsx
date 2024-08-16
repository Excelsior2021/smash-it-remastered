//component
import LinkButton from "@/components/link-button/link-button"

//react
import { useEffect } from "react"

//lib
import { protectedRoute } from "@/lib/auth"
import clientRoute from "@/enums/client-route"

//store
import headerStore from "@/store/header"

//next-auth
import { authOptions } from "../api/auth/[...nextauth]"
import { getServerSession } from "next-auth"

//types
import type { GetServerSidePropsContext } from "next"

const joinCreateGroupLinks = [
  { key: 1, href: clientRoute.joinGroup, text: "join group" },
  { key: 2, href: clientRoute.createGroup, text: "create group" },
]

const JoinCreateGroup = () => {
  const setBackRoute = headerStore(state => state.setBackRoute)
  const clearBackRoute = headerStore(state => state.clearBackRoute)

  useEffect(() => {
    setBackRoute(clientRoute.root)
    return () => clearBackRoute()
  }, [setBackRoute, clearBackRoute])

  return (
    <div>
      <h1 className="text-3xl text-center mb-10">join or create a group</h1>
      <ul className="flex flex-col items-center gap-10 max-w-96 m-auto">
        {joinCreateGroupLinks.map(link => (
          <li key={link.key} className="w-full text-center">
            <LinkButton href={link.href} text={link.text} />
          </li>
        ))}
      </ul>
    </div>
  )
}

export default JoinCreateGroup

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const props = await protectedRoute(
    context,
    getServerSession,
    clientRoute,
    authOptions
  )
  const { authenticated } = props
  if (!authenticated) return props

  return {
    props: {},
  }
}
