//react
import { useEffect, useState } from "react"
import { useRouter } from "next/router"

//lib
import { groupRequest } from "@/src/lib/api"
import apiRoute from "@/src/enums/api-route"
import method from "@/src/enums/http-method"

//types
import type { Dispatch, SetStateAction } from "react"
import type {
  apiRouteType,
  groupRequest as groupRequestType,
  methodType,
  userGroup,
  userGroupApiType,
} from "@/types"

type props = {
  name: string
  groupId: number
  memberCount: number
  userGroups: userGroup[]
  groupRequests: groupRequestType[]
  userId: number
}

const GroupQueryItem = ({
  name,
  groupId,
  memberCount,
  userGroups,
  groupRequests,
  userId,
}: props) => {
  const [request, setRequest] = useState("")
  const [submitting, setSubmmiting] = useState(false)
  const [disableButton, setDisableButton] = useState(false)
  const router = useRouter()

  enum requestState {
    join = "join",
    requested = "requested",
    joined = "joined",
  }

  useEffect(() => {
    userGroups.forEach(group => {
      if (group.id === groupId) {
        setRequest(requestState.joined)
        return
      }
    })
    if (
      request === requestState.joined ||
      request === requestState.requested ||
      userGroups.length === 3
    )
      setDisableButton(true)
    for (const request of groupRequests) {
      if (request.groupId === groupId) setRequest(requestState.requested)
    }
  }, [
    groupId,
    groupRequests,
    userGroups,
    request,
    setDisableButton,
    requestState,
  ])

  const handleGroupRequest = async (
    groupRequest: userGroupApiType,
    userId: number,
    groupId: number,
    setRequest: Dispatch<SetStateAction<string>>,
    apiRoute: apiRouteType,
    method: methodType
  ) => {
    try {
      setSubmmiting(true)
      const res: Awaited<Response> = await groupRequest(
        userId,
        groupId,
        apiRoute,
        method
      )

      if (res.ok) {
        setRequest(requestState.requested)
        // router.replace(router.asPath)
      }
    } catch (error) {
      console.log(error)
    } finally {
      setSubmmiting(false)
    }
  }

  return (
    <li className="card flex flex-col gap-4 bg-secondary p-6">
      <h2 className="text-xl capitalize">{name}</h2>
      <div className="flex justify-between items-end">
        <p className="capitalize">
          members: <span>{memberCount}/20</span>
        </p>
        <button
          className={`btn w-24 ${disableButton ? "opacity-50" : ""}`}
          onClick={() =>
            handleGroupRequest(
              groupRequest,
              userId,
              groupId,
              setRequest,
              apiRoute,
              method
            )
          }
          disabled={disableButton}>
          {submitting ? (
            <span className="loading loading-spinner loading-md"></span>
          ) : request === requestState.joined ? (
            "joined"
          ) : request === requestState.requested ? (
            "requested"
          ) : (
            "join"
          )}
        </button>
      </div>
    </li>
  )
}

export default GroupQueryItem
