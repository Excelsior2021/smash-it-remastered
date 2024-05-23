import ApproveMatchList from "@/src/components/approve-match-list/approve-match-list"
import { adminRoute, notAdmin, protectedRoute } from "@/src/lib/auth"
import prisma from "@/src/lib/prisma"
import routes from "@/src/lib/client-routes"
import { updateGroupDataForPage } from "@/src/lib/utils"
import headerStore from "@/src/store/header"
import userStore from "@/src/store/user"
import { useRouter } from "next/router"
import { useEffect } from "react"

const ApproveMatches = ({ matchSubmissions, serverMessage }) => {
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
        `${routes.approveMatches}/${activeGroup.id}`
      )
      setBackRoute(`${routes.manageGroup}/${activeGroup.id}`)
    }

    return () => clearBackRoute()
  }, [activeGroup, router, setBackRoute, clearBackRoute])

  return (
    <div className="flex flex-col justify-center items-center">
      <h1 className="text-3xl capitalize mb-6">approve matches</h1>
      {serverMessage && <p>{serverMessage}</p>}
      {matchSubmissions && (
        <div className="w-full">
          <ApproveMatchList matchSubmissions={JSON.parse(matchSubmissions)} />
        </div>
      )}
    </div>
  )
}

export default ApproveMatches

export const getServerSideProps = async context => {
  const props = await protectedRoute(context)
  const { authenticated, session } = props
  if (!authenticated) return props

  const admin = await adminRoute(context, session, prisma)
  if (!admin) return notAdmin(routes, context)

  try {
    const groupId = parseInt(context.query.groupId)
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
        },
      }
    else
      return {
        props: {
          serverMessage: "no matches to approve",
        },
      }
  } catch (error) {
    console.log(error)
  }
}
