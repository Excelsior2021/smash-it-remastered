//components
import MatchHistoryItem from "@/components/match-history-item/match-history-item"
import ServerMessage from "@/components/server-message/server-message"

//react
import { useEffect } from "react"

//next
import { useRouter } from "next/router"

//lib
import { matchHistoryEffect } from "@/lib/route-libs/match-history"
import { protectedRoute } from "@/lib/auth"
import { clientRoute } from "@/enums"
import prisma from "@/lib/prisma"
import { updateGroupDataForPage } from "@/lib/utils"

//store
import headerStore from "@/store/header"
import userStore from "@/store/user"

//next-auth
import { authOptions } from "../../api/auth/[...nextauth]"
import { getServerSession } from "next-auth"

//types
import type { match, profileUser } from "@/types"
import type { GetServerSidePropsContext } from "next"

type props = {
  profileUser: profileUser
  matches: string
  noMatches: boolean
  notInGroup: string
}

const MatchHistory = ({
  profileUser,
  matches, //comes as a string from the server but is then converted back into an object (matchesObj)
  noMatches,
  notInGroup,
}: props) => {
  let matchesObj: match[] = []
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

  useEffect(
    () =>
      matchHistoryEffect(
        activeGroup,
        updateGroupDataForPage,
        username,
        groupId,
        setBackRoute,
        clearBackRoute,
        router,
        clientRoute
      ),
    [activeGroup, router, setBackRoute, clearBackRoute, groupId, username]
  )

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
        <ServerMessage
          message={`${profileUser.username} currently has no matches in this group.`}
        />
      )}
      {matchesObj && !noMatches && (
        <div>
          <div className="text-center mb-6 text-xl">
            {matchesObj.length} matches
          </div>
          <ul className="flex flex-col gap-6 min-[640px]:items-center min-[640px]:gap-10 max-h-[400px] overflow-auto">
            {matchesObj.map((match: match) => (
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

  if (!context.query.groupId_username)
    return {
      notFound: true,
    }

  const groupId = parseInt(context.query.groupId_username[0])
  const username = context.query.groupId_username[1]

  if (!username || !groupId)
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
    orderBy: {
      matchDate: "desc",
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

  //remove stats from user object for profileUser variable
  const profileUser = { id: user.id, username: user.username }

  if (matches.length > 0)
    return {
      props: {
        profileUser,
        matches: JSON.stringify(matches),
      },
    }
  else
    return {
      props: {
        profileUser,
        noMatches: true,
      },
    }
}
