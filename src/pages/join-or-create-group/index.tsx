import LinkButton from "@/src/components/link-button/link-button"
import { protectedRoute } from "@/src/lib/auth"
import clientRoute from "@/src/lib/client-route"
import headerStore from "@/src/store/header"
import Link from "next/link"
import { useEffect } from "react"

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
        <li className="w-full text-center">
          <LinkButton href={clientRoute.joinGroup} text="join group" />
        </li>
        <li className="w-full text-center">
          <LinkButton href={clientRoute.createGroup} text="create group" />
        </li>
      </ul>
    </div>
  )
}

export default JoinCreateGroup

export const getServerSideProps = async context => {
  const props = await protectedRoute(context)
  const { authenticated, session } = props
  if (!authenticated) return props

  return {
    props: {},
  }
}
