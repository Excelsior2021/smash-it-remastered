//components
import MemberList from "@/components/member-list/member-list"
import ServerMessage from "@/components/server-message/server-message"

//react
import { useEffect } from "react"

//next
import { useRouter } from "next/router"

//lib
import { groupRequestEffect } from "../_route-lib"
import prisma from "@/lib/prisma"

import { adminRoute, notAdmin, protectedRoute } from "@/lib/auth"
import { memberListItemType } from "@/enums"
import { updateGroupDataForPage } from "@/lib/utils"
import { clientRoute } from "@/enums"

//store
import userStore from "@/store/user"
import headerStore from "@/store/header"

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

  useEffect(
    () =>
      groupRequestEffect(
        activeGroup,
        updateGroupDataForPage,
        setBackRoute,
        clearBackRoute,
        router,
        clientRoute
      ),
    [router, activeGroup, setBackRoute, clearBackRoute]
  )

  return (
    <div className="relative flex flex-col justify-center items-center">
      <h1 className="text-3xl text-center capitalize mb-6">group requests</h1>

      {serverMessage && <ServerMessage message={serverMessage} />}
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

    if (groupId === -1)
      return {
        props: { noGroup: true },
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
        props: { serverMessage: "There are currently no requests." },
      }
    }
  } catch (error) {
    console.log(error)
  }

  return {
    notFound: true,
  }
}
