//components
import LinkButton from "@/components/link-button/link-button"

//react
import { useEffect } from "react"

//next
import { useRouter } from "next/router"

//lib
import { manageGroupEffect, manageGroupLinks } from "../route-lib"
import { adminRoute, notAdmin, protectedRoute } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { clientRoute } from "@/enums"
import { updateGroupDataForPage } from "@/lib/utils"

//store
import headerStore from "@/store/header"
import navStore from "@/store/nav"
import userStore from "@/store/user"

//next-auth
import { getServerSession } from "next-auth"
import { authOptions } from "../../api/auth/[...nextauth]"

//types
import type { GetServerSidePropsContext } from "next"

const ManageGroup = () => {
  const activeGroup = userStore(state => state.activeGroup)
  const setActiveNavItem = navStore(state => state.setActiveNavItem)
  const setBackRoute = headerStore(state => state.setBackRoute)
  const clearBackRoute = headerStore(state => state.clearBackRoute)
  const router = useRouter()
  const { groupId } = router.query

  useEffect(
    () =>
      manageGroupEffect(
        activeGroup,
        updateGroupDataForPage,
        setActiveNavItem,
        setBackRoute,
        clearBackRoute,
        groupId as string,
        router,
        clientRoute
      ),
    [
      activeGroup,
      clearBackRoute,
      groupId,
      router,
      setActiveNavItem,
      setBackRoute,
    ]
  )

  return (
    <div>
      <h1 className="text-center text-3xl mb-10">Manage Group</h1>
      {activeGroup && (
        <ul className="flex flex-col gap-10 items-center max-w-96 m-auto">
          {manageGroupLinks.map(link => (
            <li key={link.key} className="w-full">
              <LinkButton
                href={`${link.hrefPrefix}/${groupId}`}
                text={link.text}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default ManageGroup

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

  const admin = await adminRoute(context, session, prisma)
  if (!admin) return notAdmin(context, clientRoute)

  return {
    props: {},
  }
}
