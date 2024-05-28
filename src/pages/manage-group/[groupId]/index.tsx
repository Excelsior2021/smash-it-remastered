import LinkButton from "@/src/components/link-button/link-button"
import { adminRoute, notAdmin, protectedRoute } from "@/src/lib/auth"
import prisma from "@/src/lib/prisma"
import clientRoute from "@/src/lib/client-route"
import { updateGroupDataForPage } from "@/src/lib/utils"
import headerStore from "@/src/store/header"
import navStore from "@/src/store/nav"
import userStore from "@/src/store/user"
import { useRouter } from "next/router"
import { useEffect } from "react"

const ManageGroup = () => {
  const activeGroup = userStore(state => state.activeGroup)
  const setActiveNavItem = navStore(state => state.setActiveNavItem)
  const setBackRoute = headerStore(state => state.setBackRoute)
  const clearBackRoute = headerStore(state => state.clearBackRoute)
  const router = useRouter()
  const { groupId } = router.query

  useEffect(() => {
    setActiveNavItem("group")
    if (activeGroup) {
      updateGroupDataForPage(
        activeGroup,
        router,
        groupId as string,
        `${clientRoute.manageGroup}/${activeGroup.id}`
      )
      setBackRoute(`${clientRoute.group}/${activeGroup.id}`)
    }

    return () => {
      setActiveNavItem(null)
      clearBackRoute()
    }
  }, [
    activeGroup,
    clearBackRoute,
    groupId,
    router,
    setActiveNavItem,
    setBackRoute,
  ])

  return (
    <div>
      <h1 className="text-center text-3xl mb-10">Manage Group</h1>
      {activeGroup && (
        <ul className="flex flex-col gap-10 items-center max-w-96 m-auto">
          <li className="w-full">
            <LinkButton
              href={`${clientRoute.groupRequests}/${groupId}`}
              text="requests"
            />
          </li>

          <li className="w-full">
            <LinkButton
              href={`${clientRoute.approveMatches}/${groupId}`}
              text="approve matches"
            />
          </li>

          <li className="w-full">
            <LinkButton
              href={`${clientRoute.removeMembers}/${groupId}`}
              text="remove members"
            />
          </li>
        </ul>
      )}
    </div>
  )
}

export default ManageGroup

export const getServerSideProps = async context => {
  const props = await protectedRoute(context)
  const { authenticated, session } = props
  if (!authenticated) return props

  const admin = await adminRoute(context, session, prisma)
  if (!admin) return notAdmin(routes, context)
  return {
    props: {},
  }
}
