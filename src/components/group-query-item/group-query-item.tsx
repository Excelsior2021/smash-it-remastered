import { groupRequest } from "@/src/lib/api"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

import type { Dispatch, SetStateAction } from "react"
import type {
  apiRouteType,
  groupRequest as groupRequestType,
  methodType,
  userGroup,
} from "@/types"
import apiRoute from "@/src/lib/api-route"
import method from "@/src/lib/http-method"

type props = {
  name: string
  groupId: number
  memberCount: number
  userGroups: userGroup[]
  groupRequests: groupRequestType[]
}

enum requestState {
  join = "join",
  requested = "requested",
  joined = "joined",
}

const GroupQueryItem = ({
  name,
  groupId,
  memberCount,
  userGroups,
  groupRequests,
}: props) => {
  const {
    data: {
      user: { id },
    },
  } = useSession()
  const [request, setRequest] = useState("")

  useEffect(() => {
    userGroups.forEach(group => {
      if (group.id === groupId) {
        setRequest(requestState.joined)
        return
      }
    })
    for (const request of groupRequests) {
      if (request.groupId === groupId) setRequest(requestState.requested)
    }
  }, [groupId, groupRequests, userGroups])

  const handleGroupRequest = async (
    userId: number,
    groupId: number,
    setRequest: Dispatch<SetStateAction<string>>,
    apiRoute: apiRouteType,
    method: methodType
  ) => {
    const res = await groupRequest(userId, groupId, apiRoute, method)
    if (res) if (res.ok) setRequest(requestState.requested)
  }

  return (
    <li className="card flex flex-col gap-4 bg-secondary p-6">
      <h2 className="text-xl capitalize">{name}</h2>
      <div className="flex justify-between items-end">
        <p className="capitalize">
          members: <span>{memberCount}/20</span>
        </p>
        <button
          className={`btn w-24 ${
            request === requestState.joined ||
            request === requestState.requested
              ? "opacity-50"
              : ""
          }`}
          onClick={() =>
            handleGroupRequest(id, groupId, setRequest, apiRoute, method)
          }
          disabled={
            request === requestState.joined ||
            request === requestState.requested
          }>
          {request === requestState.joined
            ? "joined"
            : request === requestState.requested
            ? "requested"
            : "join"}
        </button>
      </div>
    </li>
  )
}

export default GroupQueryItem
