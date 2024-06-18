//components
import LinkButton from "@/src/components/link-button/link-button"
import MemberList from "@/src/components/member-list/member-list"
import NoGroup from "@/src/components/no-group/no-group"
import StatsTable from "@/src/components/stats-table/stats-table"
import Modal from "@/src/components/modal/modal"

//react
import { useEffect, useState } from "react"

//next
import { useRouter } from "next/router"

//lib
import { protectedRoute } from "@/src/lib/auth"
import prisma from "@/src/lib/prisma"
import clientRoute from "@/src/lib/client-route"
import { handleGetUserGroups, updateGroupDataForPage } from "@/src/lib/utils"
import { userInGroup } from "@/src/lib/server-validation"
import { getUserGroups, removeUserFromGroup } from "@/src/lib/api"
import apiRoute from "@/src/lib/api-route"
import method from "@/src/lib/http-method"

//store
import navStore from "@/src/store/nav"
import userStore from "@/src/store/user"

//next-auth
import { getServerSession } from "next-auth"
import { authOptions } from "../../api/auth/[...nextauth]"

//type
import type {
  apiRouteType,
  group,
  member,
  methodType,
  userGroupApiType,
} from "@/types"
import type { GetServerSidePropsContext } from "next"

type props = {
  groupJSON: any
  members: member[]
  message: string
  notInGroup: string
  noGroup: boolean
  isAdmin: boolean
  userId: number
}

const GroupPage = ({
  groupJSON,
  members,
  notInGroup,
  noGroup,
  isAdmin,
  userId,
}: props) => {
  const { activeGroup, setActiveGroup, setGroups } = userStore(state => ({
    activeGroup: state.activeGroup,
    setActiveGroup: state.setActiveGroup,
    setGroups: state.setGroups,
  }))
  const setActiveNavItem = navStore(state => state.setActiveNavItem)
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [needAdmin, setNeedAdmin] = useState(false)
  const [leftGroup, setLeftGroup] = useState(false)

  let group: group
  if (groupJSON) group = JSON.parse(groupJSON)

  const handleLeaveGroup = async (
    removeUserFromGroup: userGroupApiType,
    userId: number,
    groupId: number,
    apiRoute: apiRouteType,
    method: methodType
  ) => {
    setSubmitting(true)
    try {
      const res = (await removeUserFromGroup(
        userId,
        groupId,
        apiRoute,
        method
      )) as Response

      if (res && res.status === 409) {
        setNeedAdmin(true)
        setTimeout(() => document.getElementById("modal").showModal())
      }

      if (res && res.ok) {
        setNeedAdmin(false)
        setLeftGroup(true)
        setTimeout(() => document.getElementById("modal").showModal())
      }
    } catch (error) {
      console.log(error)
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    setActiveNavItem("group")
    if (activeGroup)
      updateGroupDataForPage(
        activeGroup,
        router,
        router.query.groupId as string,
        `${clientRoute.group}/${activeGroup.id}`
      )
    return () => setActiveNavItem(null)
  }, [router, activeGroup, setActiveNavItem])

  if (noGroup) return <NoGroup />

  return (
    <div>
      {notInGroup && <p className="text-center">{notInGroup}</p>}
      {group && (
        <>
          {isAdmin && activeGroup && (
            <div className="mb-6 md:max-w-96">
              <LinkButton
                href={`${clientRoute.manageGroup}/${activeGroup.id}`}
                text="manage group"
              />
            </div>
          )}

          <StatsTable stats={group.stats} />
          <MemberList heading="members" members={members} groupId={group.id} />
          <div className="mt-16">
            <button
              className="btn bg-red-950 block border-0 hover:bg-red-900 w-full md:w-96 ml-auto"
              onClick={() => document.getElementById("modal").showModal()}>
              leave group
            </button>
          </div>
        </>
      )}
      {activeGroup && !needAdmin && !leftGroup && (
        <Modal
          heading="leave group"
          text={`Are you sure you want to leave ${activeGroup.name}? Data will be lost!`}
          action="confirm"
          loading={submitting}
          onClick={async () => {
            await handleLeaveGroup(
              removeUserFromGroup,
              userId,
              group.id,
              apiRoute,
              method
            )
          }}
        />
      )}
      {activeGroup && needAdmin && !leftGroup && (
        <Modal
          heading="action required"
          text={`Please assign at least one other admin to ${activeGroup.name} before leaving the group. This is to ensure the group can be managed.`}
        />
      )}
      {activeGroup && !needAdmin && leftGroup && (
        <Modal
          heading="confirmation"
          text={`You have left ${activeGroup.name}.`}
          onClickClose={async () => {
            await handleGetUserGroups(
              getUserGroups,
              setGroups,
              setActiveGroup,
              apiRoute
            )
            router.replace(clientRoute.root)
          }}
        />
      )}
    </div>
  )
}

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

  try {
    const groupId = parseInt(context.query.groupId as string)
    const userId = session.user.id
    if (groupId === -1)
      return {
        props: { noGroup: true },
      }

    const inGroup = await userInGroup(userId, groupId, prisma)

    if (!inGroup)
      return {
        props: {
          notInGroup:
            "This group does not exist or your are not part of the group.",
        },
      }

    const group = await prisma.group.findUnique({
      where: {
        id: groupId,
      },
      select: {
        id: true,
        _count: true,
        stats: {
          select: {
            matches: true,
            wins: true,
            loses: true,
            ptsFor: true,
            ptsAgainst: true,
            winRatio: true,
            isAdmin: true,
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    })

    if (group) {
      const members = group.stats.map(stat => ({
        ...stat.user,
        isAdmin: stat.isAdmin,
      }))
      return {
        props: {
          groupJSON: JSON.stringify(group),
          members,
          isAdmin: inGroup.isAdmin,
          userId: session.user.id,
        },
      }
    }
  } catch (error) {
    console.log(error)
  }

  return {
    notFound: true,
  }
}

export default GroupPage
