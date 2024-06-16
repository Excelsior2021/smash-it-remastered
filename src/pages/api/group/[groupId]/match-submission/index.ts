import { getServerSession } from "next-auth"
import { authOptions } from "../../../auth/[...nextauth]"
import { isAdmin, validateScores } from "@/src/lib/server-validation"
import prisma from "@/src/lib/prisma"
import method from "@/src/lib/http-method"

import type { NextApiRequest, NextApiResponse } from "next"

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions)

  if (!session) return res.status(401).json({ message: "not authenticated" })

  const groupId = parseInt(req.query.groupId as string)

  switch (req.method) {
    case method.post: {
      const { userId, opponentId, matchDate } = req.body
      const userScore = parseInt(req.body.userScore)
      const opponentScore = parseInt(req.body.opponentScore)

      if (!validateScores(userScore, opponentScore))
        return res.status(422).json({ error: "invalid scores" })

      try {
        const submission = await prisma.matchSubmission.create({
          data: {
            userId,
            opponentId,
            userScore,
            opponentScore,
            groupId,
            matchDate,
          },
        })

        if (submission)
          return res.status(201).json({ message: "match submitted" })
      } catch (error) {
        console.log(error)
      }
    }
    case method.delete: {
      //admin authorization required
      try {
        const admin = await isAdmin(prisma, session.user.id, groupId)
        const { matchId } = req.body
        if (admin) {
          const submission = await prisma.matchSubmission.delete({
            where: {
              id: matchId,
            },
          })
          if (submission)
            return res.status(200).json({ message: "match submission removed" })
        }
      } catch (error) {
        console.log(error)
      }
    }
  }

  return res.status(405)
}

export default handler
