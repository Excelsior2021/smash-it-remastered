import { recordMatch, removeMatchSubmission } from "@/src/lib/api"
import Tick from "../svg/tick"
import XMark from "../svg/x-mark"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"

import type { match } from "@/types"
import type { NextRouter } from "next/router"

type props = {
  match: match
}

const ApproveMatchItem = ({ match }: props) => {
  const session = useSession()
  const router = useRouter()

  const handleApproveMatch = async (match: match, router: NextRouter) => {
    const {
      userScore,
      opponentScore,
      matchDate,
      groupId,
      userId,
      opponentId,
      id,
    } = match
    if (session.data?.user)
      await recordMatch(
        userScore,
        opponentScore,
        matchDate,
        groupId,
        userId,
        opponentId,
        session.data.user.id,
        id
      )
    router.replace(router.asPath)
  }

  const handleDeclineMatch = async (
    matchId: number,
    groupId: number,
    router: NextRouter
  ) => {
    await removeMatchSubmission(matchId, groupId)
    router.replace(router.asPath)
  }

  const matchDate = new Date(match.matchDate)
  const submittedAt = new Date(match.submittedAt)

  return (
    <li className="card gap-8  bg-secondary text-sm p-6 min-[640px]:flex-row min-[640px]:justify-between capitalize">
      <div className="flex flex-col capitalize">
        <span>submitted by: {match.user.username}</span>
        <span>on {submittedAt.toDateString()}</span>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex gap-4 justify-between">
          <span>{match.user.username}</span> <span>{match.userScore}</span>
        </div>
        <div className="flex justify-between">
          <span>{match.opponent.username}</span>{" "}
          <span>{match.opponentScore}</span>
        </div>
        <span>date: {matchDate.toDateString()}</span>
      </div>

      <div className="flex justify-between self-end w-full min-[640px]:gap-10 min-[640px]:w-auto">
        <div
          className="p-2 rounded-full bg-red-700/70 hover:bg-red-600/70 cursor-pointer"
          onClick={() => handleDeclineMatch(match.id, match.groupId, router)}>
          <XMark />
        </div>
        <div
          className="p-2 rounded-full bg-green-700/70 hover:bg-green-600/70 cursor-pointer"
          onClick={() => handleApproveMatch(match, router)}>
          <Tick />
        </div>
      </div>
    </li>
  )
}

export default ApproveMatchItem
