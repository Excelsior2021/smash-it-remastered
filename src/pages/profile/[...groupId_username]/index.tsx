//components
import Avatar from "@/components/avatar/avatar"
import NoGroup from "@/components/no-group/no-group"
import LinkButton from "@/components/link-button/link-button"

//react
import { useEffect } from "react"

//next
import { useRouter } from "next/router"

//lib
import { profileEffect } from "../route-lib"
import { protectedRoute } from "@/lib/auth"
import { clientRoute } from "@/enums"
import { generateDisplayName, updateGroupDataForPage } from "@/lib/utils"
import prisma from "@/lib/prisma"
import { statKeys } from "@/enums"
import { userInGroup } from "@/lib/server-validation"

//store
import navStore from "@/store/nav"
import userStore from "@/store/user"

//next-auth
import { authOptions } from "../../api/auth/[...nextauth]"
import { getServerSession } from "next-auth"

//types
import type { profile, stats } from "@/types"
import type { GetServerSidePropsContext } from "next"

type props = {
  profile: profile
  stats: stats
  noGroup?: boolean
  sessionUserId: number
}

const Profile = ({ profile, stats, noGroup, sessionUserId }: props) => {
  const router = useRouter()
  const activeGroup = userStore(state => state.activeGroup)
  const setActiveNavItem = navStore(state => state.setActiveNavItem)

  let groupId: string = ""
  let username: string = ""

  if (router.query.groupId_username) {
    groupId = router.query.groupId_username[0]
    username = router.query.groupId_username[1]
  }

  useEffect(
    () =>
      profileEffect(
        sessionUserId,
        profile,
        activeGroup,
        groupId,
        noGroup,
        setActiveNavItem,
        updateGroupDataForPage,
        router,
        clientRoute
      ),
    [
      router,
      activeGroup,
      sessionUserId,
      noGroup,
      profile,
      setActiveNavItem,
      groupId,
    ]
  )

  if (noGroup) return <NoGroup />

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-3xl">
        <div className="flex justify-center mb-4">
          <div className="w-52 h-52 relative">
            <Avatar />
          </div>
        </div>
        <div className="text-center text-xl border-b mb-4 p-1">
          <h1 className="text-2xl">
            {generateDisplayName(
              profile.username,
              profile.firstName,
              profile.lastName
            )}
          </h1>
        </div>
        <div className="flex justify-center mb-10">
          <ul className="w-3/4">
            {statKeys
              .filter(statKey => statKey.name !== "username")
              .map(statKey => {
                let value = stats[statKey.serverName]
                if (statKey.serverName === "winRatio")
                  value = `${Math.round(value * 100)}%`
                return (
                  <li className="flex justify-between" key={statKey.name}>
                    <span>{statKey.name}: </span> <span> {value}</span>
                  </li>
                )
              })}
          </ul>
        </div>
        <div className="w-full max-w-96 m-auto">
          <LinkButton
            href={`${clientRoute.matchHistory}/${groupId}/${username}`}
            text="match history"
          />
        </div>
      </div>
    </div>
  )
}

export default Profile

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

  try {
    const groupId = parseInt(context.query.groupId_username[0])
    const username = context.query.groupId_username[1]
    if (!username || !groupId)
      return {
        notFound: true,
      }

    if (groupId === -1) {
      return {
        props: {
          noGroup: true,
        },
      }
    }

    const inGroup = await userInGroup(session.user.id, groupId, prisma)

    if (!inGroup)
      return {
        redirect: { destination: clientRoute.root, permanent: false },
      }

    const profile = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        stats: {
          where: {
            groupId,
          },
        },
      },
    })

    if (profile) {
      const stats = profile.stats[0]
      return {
        props: {
          profile,
          stats,
          sessionUserId: session.user.id,
        },
      }
    }
    return {
      notFound: true,
    }
  } catch (error) {
    console.log(error)
  }
}
