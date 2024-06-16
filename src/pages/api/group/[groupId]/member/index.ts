import { getServerSession } from "next-auth"
import { authOptions } from "../../../auth/[...nextauth]"
import { getAdminCount, isAdmin } from "@/src/lib/server-validation"
import prisma from "@/src/lib/prisma"
import method from "@/src/lib/http-method"

import type { NextApiRequest, NextApiResponse } from "next"

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ message: "not authenticated" })

  const groupId = parseInt(req.query.groupId as string)

  switch (req.method) {
    case method.delete: {
      try {
        const { userId } = req.body

        const admin = await isAdmin(prisma, session.user.id, groupId)

        if (userId !== session.user.id)
          if (!admin) return res.status(401).json({ message: "unauthorized" })

        if (admin) {
          const adminCount = await getAdminCount(groupId, prisma)
          if (adminCount === 1) {
            return res
              .status(409)
              .json({
                message:
                  "please make at least one other member an admin before leaving the group.",
              })
          }
        }

        const stats = await prisma.stat.delete({
          where: {
            userId_groupId: {
              userId,
              groupId,
            },
          },
        })

        if (stats)
          return res
            .status(200)
            .json({ message: "member removed successfully" })
        else res.status(404).json({ message: "member not found" })
      } catch (error) {
        console.log(error)
        res.status(500).json(error)
      }
    }
  }
  return res.status(405)
}

export default handler
