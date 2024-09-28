//component
import MemberList from "@/components/member-list/member-list"
import ServerMessage from "@/components/server-message/server-message"

//react
import { useEffect } from "react"

//next
import { useRouter } from "next/router"

//lib
import { removeMembersEffect } from "../_route-lib"
import { adminRoute, notAdmin, protectedRoute } from "@/lib/auth"
import { memberListItemType } from "@/enums"
import prisma from "@/lib/prisma"
import { clientRoute } from "@/enums"
import { updateGroupDataForPage } from "@/lib/utils"

//store
import headerStore from "@/store/header"
import userStore from "@/store/user"

//next-auth
import { authOptions } from "../../api/auth/[...nextauth]"
import { getServerSession } from "next-auth"

//types
import type { member } from "@/types"
import type { GetServerSidePropsContext } from "next"

type props = {
  users: member[]
  groupId: number
  noMembers: string
}

const RemoveMembers = ({ users, groupId, noMembers }: props) => {
  const activeGroup = userStore(state => state.activeGroup)
  const setBackRoute = headerStore(state => state.setBackRoute)
  const clearBackRoute = headerStore(state => state.clearBackRoute)
  const router = useRouter()

  useEffect(
    () =>
      removeMembersEffect(
        activeGroup,
        updateGroupDataForPage,
        setBackRoute,
        clearBackRoute,
        router,
        clientRoute
      ),
    [activeGroup, router, setBackRoute, clearBackRoute]
  )

  return (
    <div>
      <h1 className="text-3xl text-center capitalize mb-6">remove members</h1>
      {noMembers && <ServerMessage message={noMembers} />}
      {!noMembers && (
        <div className="flex justify-center w-full">
          <MemberList
            members={users}
            groupId={groupId}
            type={memberListItemType.removeMember}
          />
        </div>
      )}
    </div>
  )
}

export default RemoveMembers

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

  try {
    const groupId = parseInt(context.query.groupId as string)

    const stats = await prisma.stat.findMany({
      where: {
        groupId,
        AND: {
          NOT: {
            userId: session.user.id,
            isAdmin: true,
          },
        },
      },
      select: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    if (stats.length > 0) {
      const users = stats.map(user => user.user)
      return {
        props: { users, groupId: groupId, isAdmin: admin },
      }
    } else
      return {
        props: {
          noMembers: "There are only admins in this group.",
        },
      }
  } catch (error) {
    console.log(error)
  }

  return {
    notFound: true,
  }
}
