//components
import GroupResults from "@/src/components/group-results/group-results"
import EmailUnverifiedMessage from "@/src/components/email-unverified-message/email-unverified-message"

//react
import { useEffect, useState } from "react"
import { FieldValues, useForm } from "react-hook-form"

//lib
import prisma from "@/src/lib/prisma"
import { queryGroups } from "@/src/lib/api"
import { protectedRoute } from "@/src/lib/auth"
import clientRoute from "@/src/lib/client-route"
import apiRoute from "@/src/lib/api-route"
import method from "@/src/lib/http-method"

//store
import headerStore from "@/src/store/header"
import userStore from "@/src/store/user"

//next-auth
import { authOptions } from "../api/auth/[...nextauth]"
import { getServerSession } from "next-auth"

//types
import type { Dispatch, SetStateAction } from "react"
import type {
  apiRouteType,
  changeAccountDetailType,
  groupRequest,
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
  const [groups, setGroups] = useState<userGroup[] | null>(null)
  const userGroups = userStore(state => state.groups)
  const setBackRoute = headerStore(state => state.setBackRoute)
  const clearBackRoute = headerStore(state => state.clearBackRoute)

  const handleQueryGroups = async (
    queryGroups: changeAccountDetailType,
    formData: FieldValues,
    setGroups: Dispatch<SetStateAction<userGroup[] | null>>,
    apiRoute: apiRouteType,
    method: methodType
  ) => {
    const res = (await queryGroups(formData, apiRoute, method)) as Response
    if (res && res.ok) setGroups(await res.json())
    else setGroups(null)
  }

  useEffect(() => {
    setBackRoute(clientRoute.joinCreateGroup)
    return () => clearBackRoute()
  }, [setBackRoute, clearBackRoute])

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
        <div className="w-full max-w-[500px]">
          <GroupResults
            groups={groups}
            userGroups={userGroups}
            groupRequests={groupRequests}
            userId={userId}
          />
        </div>
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
