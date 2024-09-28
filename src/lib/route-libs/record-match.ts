import type { scoresSubmissionStatus } from "@/enums"
import type {
  apiRouteType,
  clientRouteType,
  makeRequestType,
  member,
  methodType,
  opponentDataType,
  recordMatchType,
  scoresSubmissionStatusType,
  submitMatchType,
  updateGroupDataForPageType,
  userGroup,
} from "@/types"
import type { NextRouter } from "next/router"
import type { Dispatch, SetStateAction } from "react"
import type { FieldValues } from "react-hook-form"

export const recordMatchEffect = (
  activeGroup: userGroup,
  updateGroupDataForPage: updateGroupDataForPageType,
  setChosenOpponent: Dispatch<SetStateAction<member | null>>,
  setBackRoute: any,
  clearBackRoute: any,
  router: NextRouter,
  clientRoute: clientRouteType
) => {
  if (activeGroup) {
    {
      updateGroupDataForPage(
        activeGroup,
        router,
        router.query.groupId as string,
        `${clientRoute.recordMatch}/${activeGroup.id}`
      )
      setBackRoute(clientRoute.root)
    }
    setChosenOpponent(null)
  }
  return () => clearBackRoute()
}

export const handleChosenOpponentCallback = (
  setChosenOpponent: Dispatch<SetStateAction<member | null>>,
  opponentData: opponentDataType,
  groupId: number
) => {
  if (groupId === opponentData.groupId) {
    setChosenOpponent(opponentData.member)
  }
}

export const handleSubmitScores = async (
  recordMatch: recordMatchType,
  submitMatch: submitMatchType,
  makeRequest: makeRequestType,
  formData: FieldValues,
  groupId: number,
  userId: number,
  opponentId: number,
  isAdmin: boolean,
  setScoresSubmitted: Dispatch<SetStateAction<scoresSubmissionStatus>>,
  scoresSubmissionStatus: scoresSubmissionStatusType,
  apiRoute: apiRouteType,
  method: methodType
) => {
  const userScore = parseInt(formData.userScore)
  const opponentScore = parseInt(formData.opponentScore)
  const matchDate = formData.matchDate
  let res: Response | undefined

  try {
    if (isAdmin) {
      res = await recordMatch(
        makeRequest,
        userScore,
        opponentScore,
        matchDate,
        groupId,
        userId,
        opponentId,
        userId, //automatically approved by admin
        apiRoute,
        method
      )
    } else {
      res = await submitMatch(
        makeRequest,
        userScore,
        opponentScore,
        matchDate,
        groupId,
        userId,
        opponentId,
        apiRoute,
        method
      )
    }

    if (res && res.ok) setScoresSubmitted(scoresSubmissionStatus.success)
    else setScoresSubmitted(scoresSubmissionStatus.failed)
  } catch (error) {
    console.log(error)
  }
}
