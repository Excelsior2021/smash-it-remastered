import MemberList from "@/src/components/member-list/member-list"

//react
import { useEffect } from "react"

//next
import { useRouter } from "next/router"

//lib
import { adminRoute, notAdmin, protectedRoute } from "@/src/lib/auth"
import memberListItemType from "@/src/lib/member-list-item-types"
import prisma from "@/src/lib/prisma"
import clientRoute from "@/src/lib/client-route"
import { updateGroupDataForPage } from "@/src/lib/utils"

//store
import headerStore from "@/src/store/header"
import userStore from "@/src/store/user"

//next-auth
import { authOptions } from "../../api/auth/[...nextauth]"
import { getServerSession } from "next-auth"

import type { member } from "@/types"
import type { GetServerSidePropsContext } from "next"

type props = {
  users: member[]
  groupId: number
  notInGroup: string
}

const RemoveMembers = ({ users, groupId, notInGroup }: props) => {
  const activeGroup = userStore(state => state.activeGroup)
  const setBackRoute = headerStore(state => state.setBackRoute)
  const clearBackRoute = headerStore(state => state.clearBackRoute)
  const router = useRouter()

  useEffect(() => {
    if (activeGroup) {
      updateGroupDataForPage(
        activeGroup,
        router,
        router.query.groupId as string,
        `${clientRoute.removeMembers}/${activeGroup.id}`
      )
      setBackRoute(`${clientRoute.manageGroup}/${activeGroup.id}`)
    }
    return () => clearBackRoute()
  }, [activeGroup, router, setBackRoute, clearBackRoute])

  if (notInGroup) return <p>{notInGroup}</p>

  return (
    <div>
      <h1 className="text-3xl text-center capitalize mb-6">remove members</h1>
      <div className="flex justify-center w-full">
        <MemberList
          members={users}
          groupId={groupId}
          type={memberListItemType.removeMember}
        />
      </div>
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
  console.log(admin)
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
    }
  } catch (error) {
    console.log(error)
  }

  return {
    notFound: true,
  }
}
