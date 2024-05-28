import MemberList from "@/src/components/member-list/member-list"
import MemberMatch from "@/src/components/member-match/member-match"
import { protectedRoute } from "@/src/lib/auth"
import { updateGroupDataForPage } from "@/src/lib/utils"
import userStore from "@/src/store/user"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useCallback, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import Modal from "@/src/components/modal/modal"
import { recordMatch, submitMatch } from "@/src/lib/api"
import headerStore from "@/src/store/header"
import clientRoute from "@/src/lib/client-route"
import prisma from "@/src/lib/prisma"
import { validateScores } from "@/src/lib/server-validation"

import type { member, player } from "@/types"

type props = {
  opponents: member[]
  groupId: number
  isAdmin: boolean
}

enum scoresSubmissionStatus {
  pending,
  success,
  failed,
}

const RecordMatch = ({ opponents, groupId, isAdmin }: props) => {
  const session = useSession()
  const {
    register,
    handleSubmit,
    getValues,
    clearErrors,
    setError,
    formState: { errors },
  } = useForm()
  const [chosenOpponent, setChosenOpponent] = useState<member | null>(null)
  const [matchData, setMatchData] = useState({
    players: [] as player[],
    matchDate: "",
  })
  const [scoresSubmitting, setScoresSubmitting] = useState(false)
  const [scoresSubmitted, setScoresSubmitted] = useState(
    scoresSubmissionStatus.pending
  )
  const router = useRouter()
  const activeGroup = userStore(state => state.activeGroup)
  const setBackRoute = headerStore(state => state.setBackRoute)
  const clearBackRoute = headerStore(state => state.clearBackRoute)

  useEffect(() => {
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
  }, [router, activeGroup, setBackRoute, clearBackRoute])

  const handleChosenOpponent = useCallback(
    (opponentData: { groupId: number; member: member }) => {
      if (groupId === opponentData.groupId) {
        setChosenOpponent(opponentData.member)
      }
    },
    [groupId]
  )

  const handleSubmitScores = async (
    formData,
    groupId: number,
    userId: number,
    opponentId: number
  ) => {
    setScoresSubmitting(true)
    const userScore = parseInt(formData.userScore)
    const opponentScore = parseInt(formData.opponentScore)
    const matchDate = formData.matchDate
    let res: Response | undefined

    try {
      if (isAdmin) {
        res = await recordMatch(
          userScore,
          opponentScore,
          matchDate,
          groupId,
          userId,
          opponentId,
          userId
        )
      } else {
        res = await submitMatch(
          userScore,
          opponentScore,
          matchDate,
          groupId,
          userId,
          opponentId
        )
      }

      if (res && res.ok) setScoresSubmitted(scoresSubmissionStatus.success)
      else setScoresSubmitted(scoresSubmissionStatus.failed)
    } catch (error) {
      console.log(error)
    } finally {
      setScoresSubmitting(false)
    }
  }

  return (
    <div>
      <Modal
        heading="submit scores"
        text={
          scoresSubmitted === scoresSubmissionStatus.success
            ? "match submitted!"
            : scoresSubmitted === scoresSubmissionStatus.failed
            ? "an error occured. please try again."
            : null
        }
        action={
          scoresSubmitted === scoresSubmissionStatus.pending ? "submit" : null
        }
        matchData={
          scoresSubmitted === scoresSubmissionStatus.pending ? matchData : null
        }
        loading={scoresSubmitting}
        onClick={handleSubmit(
          async formData =>
            await handleSubmitScores(
              formData,
              groupId,
              session.data?.user.id,
              chosenOpponent.id
            )
        )}
        onClickClose={() => router.push(clientRoute.root)}
      />

      <h1 className="text-3xl text-center mb-6">Record Match</h1>

      {opponents.length > 0 ? (
        <>
          <div>
            {!chosenOpponent && (
              <MemberList
                heading="choose an opponent"
                members={opponents}
                groupId={groupId}
                itemOnClick={handleChosenOpponent}
              />
            )}

            {chosenOpponent && session && (
              <form
                className="flex flex-col items-center gap-4 w-full lg:gap-10"
                onSubmit={handleSubmit(() => {
                  const userScore = parseInt(getValues().userScore)
                  const opponentScore = parseInt(getValues().opponentScore)
                  if (!validateScores(userScore, opponentScore)) {
                    setError("invalidScores", {
                      message:
                        "Scores are invalid. One player should have a score of 11 and both players can't have a score of 11.",
                    })
                    return
                  }
                  setMatchData({
                    players: [
                      {
                        username: session.data?.user.username,
                        score: userScore,
                      },
                      {
                        username: chosenOpponent.username,
                        score: opponentScore,
                      },
                    ],
                    matchDate: getValues().matchDate,
                  })
                  document.getElementById("modal").showModal()
                })}>
                <div className="flex flex-col gap-2 items-center">
                  <label className="capitalize text-xl" htmlFor="date">
                    match date
                  </label>
                  <input
                    {...register("matchDate", { required: true })}
                    className="text-black p-2 rounded-lg"
                    type="date"
                    id="date"
                    min="2024-01-01"
                    max={new Date().toISOString().split("T")[0]}
                  />
                  {errors.matchDate && (
                    <p className="text-error">date required</p>
                  )}
                </div>

                <div className="flex flex-col gap-10 mb-4 w-full lg:flex-row lg:justify-between">
                  <div className="w-full">
                    <MemberMatch
                      member={session.data!.user}
                      register={register}
                      inputLabel="your score"
                      inputName="userScore"
                      clearErrors={clearErrors}
                    />
                    {errors.userScore && (
                      <p className="text-error text-center mb-4">
                        please enter your score
                      </p>
                    )}
                  </div>

                  <span className="border"></span>

                  <div className="flex flex-col w-full">
                    <MemberMatch
                      member={chosenOpponent}
                      register={register}
                      inputLabel="opponent score"
                      inputName="opponentScore"
                      clearErrors={clearErrors}
                    />
                    {errors.opponentScore && (
                      <p className="text-error text-center mb-4">
                        please enter your opponent&apos;s score
                      </p>
                    )}

                    <button
                      className="btn max-w-[300px] self-center"
                      onClick={() => setChosenOpponent(null)}>
                      change opponent
                    </button>
                  </div>
                </div>

                {errors.invalidScores && (
                  <p className="text-error text-center">
                    {errors.invalidScores.message}
                  </p>
                )}

                <button className="btn btn-secondary w-full max-w-[300px]">
                  submit scores
                </button>
              </form>
            )}
          </div>
        </>
      ) : (
        <p className="text-center text-xl">Not enough members in the group</p>
      )}
    </div>
  )
}

export default RecordMatch

export const getServerSideProps = async context => {
  const props = await protectedRoute(context)
  const { authenticated, session } = props
  if (!authenticated) return props

  try {
    const groupId = parseInt(context.query.groupId)
    const stat = await prisma.stat.findUnique({
      where: {
        userId_groupId: {
          userId: session.user.id,
          groupId,
        },
      },
      select: {
        isAdmin: true,
      },
    })

    const groupWithoutUser = await prisma.stat.findMany({
      where: {
        groupId,
        AND: {
          NOT: {
            userId: session.user.id,
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    if (groupWithoutUser) {
      const opponents = groupWithoutUser.map(member => member.user)
      return {
        props: { opponents, groupId, isAdmin: stat?.isAdmin },
      }
    } else {
      return {
        notFound: true,
      }
    }
  } catch (error) {
    console.log(error)
  }
}
