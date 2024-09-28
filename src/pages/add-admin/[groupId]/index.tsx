//components
import MemberList from "@/components/member-list/member-list"
import ServerMessage from "@/components/server-message/server-message"

//react
import { useEffect } from "react"

//next
import { useRouter } from "next/router"

//lib
import { addAdminEffect } from "@/lib/route-libs/add-admin"
import prisma from "@/lib/prisma"
import { adminRoute, notAdmin, protectedRoute } from "@/lib/auth"
import { clientRoute } from "@/enums"
import { memberListItemType } from "@/enums"

//store
import userStore from "@/store/user"
import headerStore from "@/store/header"

//next-auth
import { getServerSession } from "next-auth"
import { authOptions } from "../../api/auth/[...nextauth]"

import { updateGroupDataForPage } from "@/lib/utils"

//types
import type { member } from "@/types"
import type { GetServerSidePropsContext } from "next"

type props = {
  groupId: number
  members: member[]
  noMoreMembers: string
}

const AddAdmin = ({ groupId, members, noMoreMembers }: props) => {
  const activeGroup = userStore(state => state.activeGroup)
  const setBackRoute = headerStore(state => state.setBackRoute)
  const clearBackRoute = headerStore(state => state.clearBackRoute)
  const router = useRouter()

  useEffect(
    () =>
      addAdminEffect(
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
      <h1 className="text-3xl text-center capitalize mb-6">add to admins</h1>
      {noMoreMembers && <ServerMessage message={noMoreMembers} />}
      {members && (
        <MemberList
          groupId={groupId}
          members={members}
          type={memberListItemType.addAdmin}
        />
      )}
    </div>
  )
}

export default AddAdmin

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

  const groupId = parseInt(context.query.groupId as string)

  if (groupId === -1)
    return {
      props: { noGroup: true },
    }

  const stats = await prisma.stat.findMany({
    where: {
      groupId,
      AND: {
        NOT: {
          isAdmin: true,
        },
      },
    },
    include: {
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

  const members = stats.map(stat => stat.user)

  if (members.length === 0)
    return {
      props: {
        noMoreMembers: "Seems like everyone is an admin in this group.",
      },
    }

  return {
    props: {
      groupId,
      members,
    },
  }
}
