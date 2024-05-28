import MatchHistoryItem from "@/src/components/match-history-item/match-history-item"
import { protectedRoute } from "@/src/lib/auth"
import clientRoute from "@/src/lib/client-route"
import prisma from "@/src/lib/prisma"
import { userInGroup } from "@/src/lib/server-validation"
import { updateGroupDataForPage } from "@/src/lib/utils"
import headerStore from "@/src/store/header"
import userStore from "@/src/store/user"
import { useRouter } from "next/router"
import { useEffect } from "react"

type props = {
  profileUser: {
    username: string
    id: number
  }
  matches: any
  noMatches: boolean
  notInGroup: string
}

const MatchHistory = ({
  profileUser,
  matches,
  noMatches,
  notInGroup,
}: props) => {
  let matchesObj
  if (matches) matchesObj = JSON.parse(matches)

  const activeGroup = userStore(state => state.activeGroup)
  const setBackRoute = headerStore(state => state.setBackRoute)
  const clearBackRoute = headerStore(state => state.clearBackRoute)
  const router = useRouter()

  let groupId: string = ""
  let username: string = ""

  if (router.query.groupId_username) {
    groupId = router.query.groupId_username[0]
    username = router.query.groupId_username[1]
  }

  useEffect(() => {
    if (activeGroup) {
      updateGroupDataForPage(
        activeGroup,
        router,
        groupId as string,
        `${clientRoute.matchHistory}/${activeGroup.id}/${username}`
      )
      setBackRoute(`${clientRoute.profile}/${activeGroup.id}/${username}`)
    }

    return () => clearBackRoute()
  }, [activeGroup, router, setBackRoute, clearBackRoute, groupId, username])

  return (
    <div>
      {notInGroup && (
        <p className="text-center">
          {username} is not a member of the current group
        </p>
      )}
      {!notInGroup && (
        <h1 className="text-3xl capitalize text-center mb-6">
          {profileUser.username} matches
        </h1>
      )}
      {noMatches && (
        <p className="text-center">
          {profileUser.username} currently has no matches in this group.
        </p>
      )}
      {matches && (
        <div>
          <div className="text-center mb-2 text-xl">
            {matchesObj.length} matches
          </div>
          <ul className="flex flex-col gap-6 min-[640px]:items-center min-[640px]:gap-10 max-h-[400px] overflow-auto">
            {matchesObj.map(match => (
              <MatchHistoryItem
                key={match.id}
                match={match}
                profileUser={profileUser}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default MatchHistory

export const getServerSideProps = async context => {
  const props = await protectedRoute(context)
  const { authenticated, session } = props
  if (!authenticated) return props

  const groupId = parseInt(context.query.groupId_username[0])
  const username = context.query.groupId_username[1]

  if (!username || !groupId)
    return {
      notFound: true,
    }

  const inGroup = await userInGroup(session.user.id, groupId, prisma)

  if (!inGroup)
    return {
      notFound: true,
    }

  const user = await prisma.user.findUnique({
    where: {
      username,
    },
    select: {
      username: true,
      id: true,
      stats: {
        where: {
          groupId,
        },
      },
    },
  })

  if (!user)
    return {
      notFound: true,
    }

  if (user.stats.length === 0) {
    return {
      props: {
        notInGroup: `${user.username} is not a member of the current group`,
      },
    }
  }

  const matches = await prisma.match.findMany({
    where: {
      groupId,
      OR: [{ player1Id: user.id }, { player2Id: user.id }],
    },
    include: {
      player1: {
        select: {
          id: true,
          username: true,
        },
      },
      player2: {
        select: {
          id: true,
          username: true,
        },
      },
    },
  })

  if (matches.length > 0)
    return {
      props: {
        profileUser: user,
        matches: JSON.stringify(matches),
      },
    }
  else
    return {
      props: {
        profileUser: user,
        noMatches: true,
      },
    }
}
