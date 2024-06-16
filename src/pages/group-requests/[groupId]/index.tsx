//components
import MemberList from "@/src/components/member-list/member-list"

//react
import { useEffect } from "react"

//next
import { useRouter } from "next/router"

//lib
import prisma from "@/src/lib/prisma"

import { adminRoute, notAdmin, protectedRoute } from "@/src/lib/auth"
import memberListItemType from "@/src/lib/member-list-item-types"
import { updateGroupDataForPage } from "@/src/lib/utils"
import clientRoute from "@/src/lib/client-route"

//store
import userStore from "@/src/store/user"
import headerStore from "@/src/store/header"

//next-auth
import { authOptions } from "../../api/auth/[...nextauth]"
import { getServerSession } from "next-auth"

//types
import type { member } from "@/types"
import type { GetServerSidePropsContext } from "next"

type props = {
  users: member[]
  groupId: number
  serverMessage: string
}

const GroupRequests = ({ users, groupId, serverMessage }: props) => {
  const activeGroup = userStore(state => state.activeGroup)
  const router = useRouter()
  const setBackRoute = headerStore(state => state.setBackRoute)
  const clearBackRoute = headerStore(state => state.clearBackRoute)

  useEffect(() => {
    if (activeGroup) {
      updateGroupDataForPage(
        activeGroup,
        router,
        router.query.groupId as string,
        `${clientRoute.groupRequests}/${activeGroup.id}`
      )
      setBackRoute(`${clientRoute.manageGroup}/${activeGroup.id}`)
    }
    return () => clearBackRoute()
  }, [router, activeGroup, setBackRoute, clearBackRoute])

  return (
    <div className="relative flex flex-col justify-center items-center">
      <h1 className="justify-self-center text-3xl capitalize mb-6">
        group requests
      </h1>

      {serverMessage && <p className="text-center m-6">{serverMessage}</p>}
      {users && (
        <div className="w-full max-w-[500px]">
          <MemberList
            members={users}
            groupId={groupId}
            itemOnClick={() => {}}
            type={memberListItemType.groupRequest}
            className="hover:bg-transparent"
          />
        </div>
      )}
    </div>
  )
}

export default GroupRequests

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
    const userId = session.user.id
    if (groupId === -1)
      return {
        props: { noGroup: true },
      }
    const inGroup = await prisma.stat.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId,
        },
      },
      select: {
        isAdmin: true,
      },
    })

    if (!inGroup)
      return {
        props: {
          serverMessage:
            "This group does not exist or your are not part of the group.",
        },
      }

    const groupRequests = await prisma.groupRequests.findMany({
      where: {
        groupId,
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

    if (groupRequests.length > 0) {
      const users = groupRequests.map(request => request.user)
      return {
        props: { users, groupId: groupId },
      }
    } else {
      return {
        props: { serverMessage: "there are currently no requests :(" },
      }
    }
  } catch (error) {
    console.log(error)
  }

  return {
    notFound: true,
  }
}
