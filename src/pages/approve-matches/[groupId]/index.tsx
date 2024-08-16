//components
import ApproveMatchList from "@/components/approve-match-list/approve-match-list"
import ServerMessage from "@/components/server-message/server-message"

//react
import { useEffect } from "react"

//next
import { useRouter } from "next/router"

//lib
import prisma from "@/lib/prisma"
import { adminRoute, notAdmin, protectedRoute } from "@/lib/auth"
import clientRoute from "@/enums/client-route"
import { updateGroupDataForPage } from "@/lib/utils"

//store
import headerStore from "@/store/header"
import userStore from "@/store/user"

//next-auth
import { authOptions } from "../../api/auth/[...nextauth]"
import { getServerSession } from "next-auth"

//types
import type { GetServerSidePropsContext } from "next"

type props = {
  matchSubmissions?: string
  noMatches?: string
  adminUserId?: number
}

const ApproveMatches = ({
  matchSubmissions,
  noMatches,
  adminUserId,
}: props) => {
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
        `${clientRoute.approveMatches}/${activeGroup.id}`
      )
      setBackRoute(`${clientRoute.manageGroup}/${activeGroup.id}`)
    }

    return () => clearBackRoute()
  }, [activeGroup, router, setBackRoute, clearBackRoute])

  return (
    <div className="flex flex-col justify-center items-center">
      <h1 className="text-3xl capitalize mb-6">approve matches</h1>
      {noMatches && <ServerMessage message={noMatches} />}
      {matchSubmissions && adminUserId && (
        <div className="w-full">
          <ApproveMatchList
            matchSubmissions={JSON.parse(matchSubmissions)}
            adminUserId={adminUserId}
          />
        </div>
      )}
    </div>
  )
}

export default ApproveMatches

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
    const matchSubmissions = await prisma.matchSubmission.findMany({
      where: {
        groupId,
      },
      include: {
        user: {
          select: {
            username: true,
          },
        },
        opponent: {
          select: {
            username: true,
          },
        },
      },
    })

    if (matchSubmissions.length > 0)
      return {
        props: {
          matchSubmissions: JSON.stringify(matchSubmissions),
          adminUserId: session.user.id,
        },
      }
    else
      return {
        props: {
          noMatches: "No matches to approve",
        },
      }
  } catch (error) {
    console.log(error)
  }
}
