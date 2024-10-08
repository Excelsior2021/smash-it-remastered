//components
import MemberList from "@/components/member-list/member-list"
import MemberMatch from "@/components/member-match/member-match"
import EmailUnverifiedMessage from "@/components/email-unverified-message/email-unverified-message"
import Modal from "@/components/modal/modal"
import ServerMessage from "@/components/server-message/server-message"
import NoGroup from "@/components/no-group/no-group"

//react
import { useCallback, useEffect, useState, type ReactNode } from "react"
import { useForm } from "react-hook-form"

//next
import { useRouter } from "next/router"

//lib
import {
  handleChosenOpponentCallback,
  handleSubmitScores,
  recordMatchEffect,
} from "@/lib/route-libs/record-match"
import prisma from "@/lib/prisma"
import { protectedRoute } from "@/lib/auth"
import { makeRequest, showModal, updateGroupDataForPage } from "@/lib/utils"
import { recordMatch, submitMatch } from "@/lib/api"
import { clientRoute, scoresSubmissionStatus } from "@/enums"
import { validateScores } from "@/lib/server-validation"
import { apiRoute } from "@/enums"
import { method } from "@/enums"

//store
import userStore from "@/store/user"
import headerStore from "@/store/header"

//next-auth
import { authOptions } from "../../api/auth/[...nextauth]"
import { getServerSession } from "next-auth"

//types
import type { member, opponentDataType, player } from "@/types"
import type { GetServerSidePropsContext } from "next"

type props = {
  opponents: member[]
  groupId: number
  isAdmin: boolean
  emailUnverified?: true
  session: any
  noGroup?: boolean
}

const RecordMatch = ({
  opponents,
  groupId,
  isAdmin,
  emailUnverified,
  session,
  noGroup,
}: props) => {
  const {
    register,
    handleSubmit,
    getValues,
    clearErrors,
    setError,
    formState: { errors, isSubmitting },
  } = useForm()
  const [chosenOpponent, setChosenOpponent] = useState<member | null>(null)
  const [matchData, setMatchData] = useState({
    players: [] as player[],
    matchDate: "",
  })
  const [scoresSubmitted, setScoresSubmitted] = useState(
    scoresSubmissionStatus.pending
  )
  const router = useRouter()
  const activeGroup = userStore(state => state.activeGroup)
  const setBackRoute = headerStore(state => state.setBackRoute)
  const clearBackRoute = headerStore(state => state.clearBackRoute)
  const handleChosenOpponent = useCallback(handleChosenOpponentCallback, [
    groupId,
  ])

  useEffect(
    () =>
      recordMatchEffect(
        activeGroup,
        updateGroupDataForPage,
        setChosenOpponent,
        setBackRoute,
        clearBackRoute,
        router,
        clientRoute
      ),
    [router, activeGroup, setBackRoute, clearBackRoute]
  )

  if (emailUnverified) return <EmailUnverifiedMessage />

  if (noGroup) return <NoGroup />

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
          loading={isSubmitting}
          onClick={handleSubmit(
            async formData =>
              await handleSubmitScores(
                recordMatch,
                submitMatch,
                makeRequest,
                formData,
                groupId,
                session.user.id,
                chosenOpponent.id,
                isAdmin,
                setScoresSubmitted,
                scoresSubmissionStatus,
                apiRoute,
                method
              )
          )}
          onClickClose={
            scoresSubmitted === scoresSubmissionStatus.success
              ? () => router.push(clientRoute.root)
              : undefined
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
                itemOnClick={(opponentData: opponentDataType) =>
                  handleChosenOpponent(setChosenOpponent, opponentData, groupId)
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
                  showModal()
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
                    {errors.invalidScores.message as ReactNode}
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
    if (groupId === -1)
      return {
        props: { noGroup: true },
      }

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
