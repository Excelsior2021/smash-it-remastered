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
import routes from "@/src/lib/client-routes"
import prisma from "@/src/lib/prisma"

import type { member } from "@/types"

type props = {
  opponents: member[]
  groupId: number
  isAdmin: boolean
}

const RecordMatch = ({ opponents, groupId, isAdmin }: props) => {
  const session = useSession()
  const { register, handleSubmit } = useForm()
  const [chosenOpponent, setChosenOpponent] = useState<member | null>(null)
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
          `${routes.recordMatch}/${activeGroup.id}`
        )
        setBackRoute(routes.root)
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
    document.getElementById("modal").close()
    const userScore = parseInt(formData.userScore)
    const opponentScore = parseInt(formData.opponentScore)
    const matchDate = formData.matchDate

    if (isAdmin) {
      const res = await recordMatch(
        userScore,
        opponentScore,
        matchDate,
        groupId,
        userId,
        opponentId,
        userId
      )
    } else {
      const res = await submitMatch(
        userScore,
        opponentScore,
        matchDate,
        groupId,
        userId,
        opponentId
      )
    }
  }

  return (
    <div>
      <Modal
        heading="submit scores"
        action="submit"
        text="ready to submit the scores?"
        onClick={handleSubmit(
          async formData =>
            await handleSubmitScores(
              formData,
              groupId,
              session.data?.user.id,
              chosenOpponent.id
            )
        )}
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
                onSubmit={handleSubmit(() =>
                  document.getElementById("modal").showModal()
                )}>
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
                </div>

                <div className="flex flex-col gap-10 mb-12 lg:flex-row lg:justify-between">
                  <MemberMatch
                    member={session.data!.user}
                    register={register}
                    inputLabel="your score"
                    inputName="userScore"
                  />

                  <span className="border"></span>

                  <div className="flex flex-col">
                    <MemberMatch
                      member={chosenOpponent}
                      register={register}
                      inputLabel="opponent score"
                      inputName="opponentScore"
                    />

                    <button
                      className="btn max-w-[300px] self-center"
                      onClick={() => setChosenOpponent(null)}>
                      change opponent
                    </button>
                  </div>
                </div>

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

    const groupWithoutUser = await prisma.group.findUnique({
      where: {
        id: groupId,
      },
      include: {
        _count: true,
        stats: {
          where: {
            userId: { not: session.user.id },
          },
          select: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    })

    if (groupWithoutUser) {
      const opponents = groupWithoutUser.stats.map(member => member.user)
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
