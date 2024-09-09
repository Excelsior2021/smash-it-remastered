import type {
  apiRouteType,
  makeRequestType,
  matchSubmission,
  methodType,
  recordMatchType,
  removeMatchSubmissionType,
} from "@/types"
import type { Dispatch, SetStateAction } from "react"

export const handleApproveMatch = async (
  makeRequest: makeRequestType,
  recordMatch: recordMatchType,
  matchSubmission: matchSubmission,
  adminUserId: number,
  setSubmitted: Dispatch<SetStateAction<boolean>>,
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
    makeRequest,
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

export const handleDeclineMatch = async (
  makeRequest: makeRequestType,
  removeMatchSubmission: removeMatchSubmissionType,
  matchId: number,
  groupId: number,
  setSubmitted: Dispatch<SetStateAction<boolean>>,
  apiRoute: apiRouteType,
  method: methodType
) => {
  const res: Awaited<Response> = await removeMatchSubmission(
    makeRequest,
    matchId,
    groupId,
    apiRoute,
    method
  )

  if (res.ok) setSubmitted(true)
}
