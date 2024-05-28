import LinkButton from "@/src/components/link-button/link-button"
import MemberList from "@/src/components/member-list/member-list"
import NoGroup from "@/src/components/no-group/no-group"
import StatsTable from "@/src/components/stats-table/stats-table"
import { protectedRoute } from "@/src/lib/auth"
import prisma from "@/src/lib/prisma"
import clientRoute from "@/src/lib/client-route"
import { updateGroupDataForPage } from "@/src/lib/utils"
import navStore from "@/src/store/nav"
import userStore from "@/src/store/user"
import { member } from "@/types"
import { useRouter } from "next/router"
import { useEffect } from "react"
import { userInGroup } from "@/src/lib/server-validation"

type props = {
  groupJSON: any
  members: member[]
  message: string
  notInGroup: string
  noGroup: boolean
  isAdmin: boolean
}

const GroupPage = ({
  groupJSON,
  members,
  notInGroup,
  noGroup,
  isAdmin,
}: props) => {
  const activeGroup = userStore(state => state.activeGroup)
  const setActiveNavItem = navStore(state => state.setActiveNavItem)
  const router = useRouter()

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

  let group
  if (groupJSON) group = JSON.parse(groupJSON)

  return (
    <div>
      {notInGroup && <p className="text-center">{notInGroup}</p>}
      {group && (
        <>
          {isAdmin && activeGroup && (
            <div className="max-w-96 mb-6">
              <LinkButton
                href={`${clientRoute.manageGroup}/${activeGroup.id}`}
                text="manage group"
              />
            </div>
          )}
          <StatsTable stats={group.stats} />
          <MemberList heading="members" members={members} groupId={group.id} />
        </>
      )}
    </div>
  )
}

export const getServerSideProps = async context => {
  const props = await protectedRoute(context)
  const { authenticated, session } = props
  if (!authenticated) return props

  try {
    const groupId = parseInt(context.query.groupId)
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
      const members = group.stats.map(stat => stat.user)
      return {
        props: {
          groupJSON: JSON.stringify(group),
          members,
          isAdmin: inGroup.isAdmin,
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
