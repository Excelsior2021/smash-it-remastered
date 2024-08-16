//components
import GroupResults from "@/components/group-results/group-results"
import EmailUnverifiedMessage from "@/components/email-unverified-message/email-unverified-message"

//react
import { useEffect, useState, type Dispatch, type SetStateAction } from "react"
import { FieldValues, useForm } from "react-hook-form"

//lib
import prisma from "@/lib/prisma"
import { getGroupRequests, queryGroups } from "@/lib/api"
import { protectedRoute } from "@/lib/auth"
import clientRoute from "@/enums/client-route"
import apiRoute from "@/enums/api-route"
import method from "@/enums/http-method"
import { debounce, makeRequest } from "@/lib/utils"

//store
import headerStore from "@/store/header"
import userStore from "@/store/user"

//next-auth
import { authOptions } from "../api/auth/[...nextauth]"
import { getServerSession } from "next-auth"

//types
import type {
  apiRouteType,
  apiRequestType,
  groupRequest,
  groupResult,
  methodType,
  userGroup,
} from "@/types"
import type { GetServerSidePropsContext } from "next"

type props = {
  groupRequests: groupRequest[]
  emailUnverified: true | undefined
  userId: number
}

const JoinGroup = ({ groupRequests, emailUnverified, userId }: props) => {
  const { register, handleSubmit } = useForm()
  const [groups, setGroups] = useState<groupResult[] | null>(null)
  const [groupRequestsState, setGroupRequestsState] =
    useState<groupRequest[]>(groupRequests)
  const userGroups = userStore(state => state.groups)
  const setBackRoute = headerStore(state => state.setBackRoute)
  const clearBackRoute = headerStore(state => state.clearBackRoute)

  const handleQueryGroups = debounce(
    async (
      queryGroups: apiRequestType,
      formData: FieldValues,
      setGroups: Dispatch<SetStateAction<userGroup[] | null>>,
      apiRoute: apiRouteType,
      method: methodType
    ) => {
      const res: Awaited<Response> = await queryGroups(
        makeRequest,
        formData,
        apiRoute,
        method
      )

      const res2: Awaited<Response> = await getGroupRequests(
        makeRequest,
        apiRoute
      )

      if (res && res.ok && res2 && res2.ok) {
        setGroups(await res.json())
        setGroupRequestsState(await res2.json())
      } else setGroups(null)
    },
    250
  )

  useEffect(() => {
    setBackRoute(clientRoute.joinCreateGroup)
    return () => clearBackRoute()
  }, [setBackRoute, clearBackRoute, groups])

  if (emailUnverified) return <EmailUnverifiedMessage />

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl text-center capitalize mb-6">join a group</h1>
        <p className="text-center">
          please note you can only be a member of a maximum of 3 groups
        </p>
      </div>
      <div className="flex flex-col items-center">
        <search className="mb-6 w-full max-w-96">
          <form
            className="flex flex-col gap-8"
            onChange={handleSubmit(async (formData: FieldValues) =>
              handleQueryGroups(
                queryGroups,
                formData,
                setGroups,
                apiRoute,
                method
              )
            )}>
            <label className="hidden" htmlFor="query">
              search for groups
            </label>
            <input
              {...register("query")}
              placeholder="search groups"
              className="input text-black"
              type="search"
            />
          </form>
        </search>
        {groups && (
          <div className="w-full max-w-[500px]">
            <GroupResults
              groups={groups}
              userGroups={userGroups}
              groupRequests={groupRequestsState}
              userId={userId}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default JoinGroup

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

  if (!session.user.emailVerified)
    return {
      props: {
        emailUnverified: true,
      },
    }

  const groupRequests = await prisma.groupRequests.findMany({
    where: {
      userId: session.user.id,
    },
  })

  return {
    props: {
      groupRequests,
      userId: session.user.id,
    },
  }
}
