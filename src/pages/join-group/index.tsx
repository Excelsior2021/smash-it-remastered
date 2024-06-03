import GroupResults from "@/src/components/group-results/group-results"
import { queryGroups } from "@/src/lib/api"
import { protectedRoute } from "@/src/lib/auth"
import clientRoute from "@/src/lib/client-route"
import headerStore from "@/src/store/header"
import userStore from "@/src/store/user"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import prisma from "@/src/lib/prisma"
import { authOptions } from "../api/auth/[...nextauth]"
import { getServerSession } from "next-auth"
import apiRoute from "@/src/lib/api-route"
import method from "@/src/lib/http-method"

import type { Dispatch, SetStateAction } from "react"
import type { apiRouteType, groupRequest, methodType, userGroup } from "@/types"

type props = {
  groupRequests: groupRequest[]
}

const JoinGroup = ({ groupRequests }: props) => {
  const { register, handleSubmit, setError } = useForm()
  const [groups, setGroups] = useState<userGroup[] | null>(null)
  const userGroups = userStore(state => state.groups)
  const setBackRoute = headerStore(state => state.setBackRoute)
  const clearBackRoute = headerStore(state => state.clearBackRoute)

  const handleQueryGroups = async (
    query: string,
    setGroups: Dispatch<SetStateAction<userGroup[] | null>>,
    queryGroups,
    apiRoute: apiRouteType,
    method: methodType
  ) => {
    setGroups(await queryGroups(query.toLowerCase(), apiRoute, method))
  }

  useEffect(() => {
    setBackRoute(clientRoute.joinCreateGroup)
    return () => clearBackRoute()
  }, [setBackRoute, clearBackRoute])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl text-center capitalize">join groups</h1>
        <p className="text-center">
          please note you can only be a member of a maximum of 3 groups
        </p>
      </div>
      <div className="flex flex-col items-center">
        <search className="mb-6 w-full max-w-96">
          <form
            className="flex flex-col gap-8"
            onChange={handleSubmit(async ({ query }) =>
              handleQueryGroups(query, setGroups, queryGroups, apiRoute, method)
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
        <div className="w-full max-w-[500px]">
          <GroupResults
            groups={groups}
            userGroups={userGroups}
            groupRequests={groupRequests}
          />
        </div>
      </div>
    </div>
  )
}

export default JoinGroup

export const getServerSideProps = async context => {
  const props = await protectedRoute(
    context,
    getServerSession,
    clientRoute,
    authOptions
  )
  const { authenticated, session } = props
  if (!authenticated) return props

  const groupRequests = await prisma.groupRequests.findMany({
    where: {
      userId: session.user.id,
    },
  })

  return {
    props: {
      groupRequests,
    },
  }
}
