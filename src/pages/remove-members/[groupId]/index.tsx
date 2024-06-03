import MemberList from "@/src/components/member-list/member-list"
import { adminRoute, notAdmin, protectedRoute } from "@/src/lib/auth"
import memberListItemType from "@/src/lib/member-list-item-types"
import prisma from "@/src/lib/prisma"
import clientRoute from "@/src/lib/client-route"
import { updateGroupDataForPage } from "@/src/lib/utils"
import headerStore from "@/src/store/header"
import userStore from "@/src/store/user"
import { member } from "@/types"
import { useRouter } from "next/router"
import { useEffect } from "react"
import { authOptions } from "../../api/auth/[...nextauth]"
import { getServerSession } from "next-auth"

type props = {
  users: member[]
  groupId: number
}

const RemoveMembers = ({ users, groupId }: props) => {
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

export const getServerSideProps = async context => {
  const props = await protectedRoute(
    context,
    getServerSession,
    clientRoute,
    authOptions
  )
  const { authenticated, session } = props
  if (!authenticated) return props

  const admin = await adminRoute(context, session, prisma)
  if (!admin) notAdmin(context, clientRoute)

  try {
    const groupId = parseInt(context.query.groupId)
    if (groupId === -1)
      return {
        props: { noGroup: true },
      }

    const stats = await prisma.stat.findMany({
      where: {
        groupId,
        AND: {
          NOT: {
            userId: session.user.id,
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
