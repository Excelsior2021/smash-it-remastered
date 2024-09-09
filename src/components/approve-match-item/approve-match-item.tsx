//components
import Tick from "../svg/tick"
import XMark from "../svg/x-mark"

//react
import { useState } from "react"

//lib
import { handleApproveMatch, handleDeclineMatch } from "./component-lib"
import { recordMatch, removeMatchSubmission } from "@/lib/api"
import { apiRoute, method } from "@/enums"
import { makeRequest } from "@/lib/utils"

//types
import type { matchSubmission } from "@/types"

type props = {
  matchSubmission: matchSubmission
  adminUserId: number
}

const ApproveMatchItem = ({ matchSubmission, adminUserId }: props) => {
  const [submitted, setSubmitted] = useState(false)
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
              makeRequest,
              removeMatchSubmission,
              matchSubmission.id,
              matchSubmission.groupId,
              setSubmitted,
              apiRoute,
              method
            )
          }>
          <XMark />
        </div>
        <div
          className="p-2 rounded-full bg-green-700/70 hover:bg-green-600/70 cursor-pointer"
          onClick={() =>
            handleApproveMatch(
              makeRequest,
              recordMatch,
              matchSubmission,
              adminUserId,
              setSubmitted,
              apiRoute,
              method
            )
          }>
          <Tick />
        </div>
      </div>
    </li>
  )
}

export default ApproveMatchItem
