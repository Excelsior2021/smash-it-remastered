//components
import Tick from "../svg/tick"
import XMark from "../svg/x-mark"

//react
import { useState } from "react"

//next

//lib
import { recordMatch, removeMatchSubmission } from "@/src/lib/api"
import apiRoute from "@/src/lib/api-route"
import method from "@/src/lib/http-method"

//types
import type {
  apiRouteType,
  matchSubmission,
  methodType,
  recordMatchType,
  removeMatchSubmissionType,
} from "@/types"

type props = {
  matchSubmission: matchSubmission
  adminUserId: number
}

const ApproveMatchItem = ({ matchSubmission, adminUserId }: props) => {
  const [submitted, setSubmitted] = useState(false)

  const handleApproveMatch = async (
    recordMatch: recordMatchType,
    matchSubmission: matchSubmission,
    apiRoute: apiRouteType,
    method: methodType
  ) => {
    const {
      userScore,
      opponentScore,
      matchDate,
      groupId,
      userId,
      opponentId,
      id, //matchId
    } = matchSubmission
    const res: Awaited<Response> = await recordMatch(
      userScore,
      opponentScore,
      matchDate,
      groupId,
      userId,
      opponentId,
      adminUserId,
      apiRoute,
      method,
      id //matchId
    )

    if (res.ok) setSubmitted(true)
  }

  const handleDeclineMatch = async (
    removeMatchSubmission: removeMatchSubmissionType,
    matchId: number,
    groupId: number,
    apiRoute: apiRouteType,
    method: methodType
  ) => {
    const res: Awaited<Response> = await removeMatchSubmission(
      matchId,
      groupId,
      apiRoute,
      method
    )

    if (res.ok) setSubmitted(true)
  }

  const matchDate = new Date(matchSubmission.matchDate)
  const submittedAt = new Date(matchSubmission.submittedAt)
  const user = matchSubmission.user
    ? matchSubmission.user
    : { username: "deleted user" }
  const opponent = matchSubmission.opponent
    ? matchSubmission.opponent
    : { username: "deleted user" }

  return (
    <li
      className={`card gap-8 bg-secondary text-sm p-6 min-[640px]:flex-row min-[640px]:justify-between capitalize ${
        submitted ? "hidden" : null
      }`}>
      <div className="flex flex-col capitalize">
        <span>submitted by: {user.username}</span>
        <span>on {submittedAt.toDateString()}</span>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex gap-4 justify-between">
          <span>{user.username}</span> <span>{matchSubmission.userScore}</span>
        </div>
        <div className="flex justify-between">
          <span>{opponent.username}</span>{" "}
          <span>{matchSubmission.opponentScore}</span>
        </div>
        <span>date: {matchDate.toDateString()}</span>
      </div>

      <div className="flex justify-between self-end w-full min-[640px]:gap-10 min-[640px]:w-auto">
        <div
          className="p-2 rounded-full bg-red-700/70 hover:bg-red-600/70 cursor-pointer"
          onClick={() =>
            handleDeclineMatch(
              removeMatchSubmission,
              matchSubmission.id,
              matchSubmission.groupId,
              apiRoute,
              method
            )
          }>
          <XMark />
        </div>
        <div
          className="p-2 rounded-full bg-green-700/70 hover:bg-green-600/70 cursor-pointer"
          onClick={() =>
            handleApproveMatch(recordMatch, matchSubmission, apiRoute, method)
          }>
          <Tick />
        </div>
      </div>
    </li>
  )
}

export default ApproveMatchItem
