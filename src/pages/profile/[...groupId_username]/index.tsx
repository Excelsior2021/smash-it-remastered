import Avatar from "@/src/components/avatar/avatar"
import NoGroup from "@/src/components/no-group/no-group"
import { protectedRoute } from "@/src/lib/auth"
import clientRoute from "@/src/lib/client-route"
import { generateDisplayName, updateGroupDataForPage } from "@/src/lib/utils"
import navStore from "@/src/store/nav"
import userStore from "@/src/store/user"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect } from "react"
import prisma from "@/src/lib/prisma"
import statKeys from "@/src/lib/stat-keys"
import { userInGroup } from "@/src/lib/server-validation"
import LinkButton from "@/src/components/link-button/link-button"

import type { profile } from "@/types"

type props = {
  profile: profile
  serverMessage: string
  noGroup: boolean
}

const Profile = ({ profile, serverMessage, noGroup }: props) => {
  const router = useRouter()
  const session = useSession()
  const activeGroup = userStore(state => state.activeGroup)
  const setActiveNavItem = navStore(state => state.setActiveNavItem)

  let groupId: string = ""
  let username: string = ""

  if (router.query.groupId_username) {
    groupId = router.query.groupId_username[0]
    username = router.query.groupId_username[1]
  }

  useEffect(() => {
    if (noGroup) setActiveNavItem("profile")

    if (!noGroup && !serverMessage) {
      if (profile)
        if (profile.id === session.data?.user.id) setActiveNavItem("profile")
      if (activeGroup)
        updateGroupDataForPage(
          activeGroup,
          router,
          groupId,
          `${clientRoute.profile}/${activeGroup.id}/${profile.username}`
        )
    }
    return () => setActiveNavItem(null)
  }, [
    router,
    activeGroup,
    session,
    noGroup,
    profile,
    setActiveNavItem,
    serverMessage,
    groupId,
  ])

  if (noGroup) return <NoGroup />

  if (serverMessage) return <p className="text-center">{serverMessage}</p>

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-3xl">
        <div className="flex justify-center mb-4">
          <div className="w-52 h-52 relative">
            <Avatar />
          </div>
        </div>
        <div className="text-center text-xl border-b mb-4 p-1">
          <h1>
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
                let value = profile.stats[statKey.serverName]
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

export const getServerSideProps = async context => {
  const props = await protectedRoute(context)
  const { authenticated, session } = props
  if (!authenticated) return props

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
        notFound: true,
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
      if (profile.stats.length === 0) {
        return {
          props: {
            serverMessage: `${profile.username} is not a member of the current group`,
          },
        }
      }
      profile.stats = profile.stats[0]
      return {
        props: {
          profile,
        },
      }
    }
  } catch (error) {
    console.log(error)
  }
}
