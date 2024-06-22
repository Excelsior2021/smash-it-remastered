//components
import MemberList from "@/src/components/member-list/member-list"
import MemberMatch from "@/src/components/member-match/member-match"
import EmailUnverifiedMessage from "@/src/components/email-unverified-message/email-unverified-message"
import Modal from "@/src/components/modal/modal"
import ServerMessage from "@/src/components/server-message/server-message"

//react
import { useCallback, useEffect, useState } from "react"
import { useForm } from "react-hook-form"

//next
import { useRouter } from "next/router"

//lib
import prisma from "@/src/lib/prisma"
import { protectedRoute } from "@/src/lib/auth"
import { updateGroupDataForPage } from "@/src/lib/utils"
import { recordMatch, submitMatch } from "@/src/lib/api"
import clientRoute from "@/src/lib/client-route"
import { validateScores } from "@/src/lib/server-validation"
import apiRoute from "@/src/lib/api-route"
import method from "@/src/lib/http-method"

//store
import userStore from "@/src/store/user"
import headerStore from "@/src/store/header"

//next-auth
import { authOptions } from "../../api/auth/[...nextauth]"
import { getServerSession } from "next-auth"

//types
import type { Dispatch, SetStateAction } from "react"
import type { apiRouteType, member, methodType, player } from "@/types"
import type { FieldValues } from "react-hook-form"
import type { GetServerSidePropsContext } from "next"

type props = {
  opponents: member[]
  groupId: number
  isAdmin: boolean
  emailUnverified: true | undefined
  session: any
}

type opponentData = { groupId: number; member: member }

enum scoresSubmissionStatus {
  pending,
  success,
  failed,
}

const RecordMatch = ({
  opponents,
  groupId,
  isAdmin,
  emailUnverified,
  session,
}: props) => {
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
    (
      setChosenOpponent: Dispatch<SetStateAction<member | null>>,
      opponentData: opponentData
    ) => {
      if (groupId === opponentData.groupId) {
        setChosenOpponent(opponentData.member)
      }
    },
    [groupId]
  )

  const handleSubmitScores = async (
    formData: FieldValues,
    groupId: number,
    userId: number,
    opponentId: number,
    apiRoute: apiRouteType,
    method: methodType
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
          userId, //automatically approved by admin
          apiRoute,
          method
        )
      } else {
        res = await submitMatch(
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
    } finally {
      setScoresSubmitting(false)
    }
  }

  if (emailUnverified) return <EmailUnverifiedMessage />

  return (
    <div>
      {chosenOpponent && (
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
            scoresSubmitted === scoresSubmissionStatus.pending
              ? matchData
              : null
          }
          loading={scoresSubmitting}
          onClick={handleSubmit(
            async formData =>
              await handleSubmitScores(
                formData,
                groupId,
                session.user.id,
                chosenOpponent.id,
                apiRoute,
                method
              )
          )}
          onClickClose={
            scoresSubmitted === scoresSubmissionStatus.success
              ? () => router.push(clientRoute.root)
              : null
          }
        />
      )}

      <h1 className="text-3xl text-center mb-6">Record Match</h1>

      {opponents.length > 0 ? (
        <>
          <div>
            {!chosenOpponent && (
              <MemberList
                heading="choose an opponent"
                members={opponents}
                groupId={groupId}
                itemOnClick={(opponentData: opponentData) =>
                  handleChosenOpponent(setChosenOpponent, opponentData)
                }
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
                        username: session.user.username,
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
                      member={session.user}
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
        <ServerMessage message="Not enough members in the group" />
      )}
    </div>
  )
}

export default RecordMatch

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

  try {
    const groupId = parseInt(context.query.groupId as string)
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
        props: { opponents, groupId, isAdmin: stat?.isAdmin, session },
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
