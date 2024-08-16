import { isAdmin, validateScores } from "@/lib/server-validation"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../auth/[...nextauth]"
import prisma from "@/lib/prisma"
import method from "@/enums/http-method"

import type { NextApiRequest, NextApiResponse } from "next"

//admin authorization required

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ message: "not authenticated" })

  const groupId = parseInt(req.query.groupId as string)
  const admin = await isAdmin(prisma, session.user.id, groupId)

  if (!admin) return res.status(401).json({ message: "unauthorized" })

  switch (req.method) {
    case method.post: {
      try {
        const {
          player1Id,
          player2Id,
          userScore,
          opponentScore,
          approvedBy,
          matchDate,
          matchId,
        } = req.body

        const player1Score = parseInt(userScore)
        const player2Score = parseInt(opponentScore)

        if (!validateScores(player1Score, player2Score))
          return res.status(422).json({ error: "invalid scores" })

        const match = await prisma.$transaction(async tx => {
          const match = await tx.match.create({
            data: {
              player1Id,
              player2Id,
              player1Score,
              player2Score,
              groupId,
              approvedBy,
              matchDate,
              submittedAt: new Date(),
            },
          })

          //update player1 stats
          if (player1Id)
            await tx.stat.update({
              where: { userId_groupId: { userId: player1Id, groupId } },
              data: {
                wins: { increment: player1Score > player2Score ? 1 : 0 },
                loses: { increment: player1Score < player2Score ? 1 : 0 },
                ptsFor: { increment: player1Score },
                ptsAgainst: { increment: player2Score },
              },
            })

          //update player2 stats
          if (player2Id)
            await tx.stat.update({
              where: { userId_groupId: { userId: player2Id, groupId } },
              data: {
                wins: { increment: player2Score > player1Score ? 1 : 0 },
                loses: { increment: player2Score < player1Score ? 1 : 0 },
                ptsFor: { increment: player2Score },
                ptsAgainst: { increment: player1Score },
              },
            })

          //delete matchSubmission from matchSubmission table if exists
          if (matchId)
            await tx.matchSubmission.delete({
              where: {
                id: matchId,
              },
            })

          return match
        })

        if (match) return res.status(201).json(match)
      } catch (error) {
        console.log(error)
      }
    }
  }

  return res.status(405)
}

export default handler
