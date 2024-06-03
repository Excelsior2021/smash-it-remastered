import { getServerSession } from "next-auth"
import { authOptions } from "../../../auth/[...nextauth]"
import { isAdmin, isMaxGroupMembers } from "@/src/lib/server-validation"
import prisma from "@/src/lib/prisma"
import method from "@/src/lib/http-method"

import type { NextApiRequest, NextApiResponse } from "next"

//admin authorization required

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions)

  if (!session) return res.status(401).json({ message: "not authenticated" })

  switch (req.method) {
    case method.post: {
      const groupId = parseInt(req.query.groupId as string)
      const admin = await isAdmin(prisma, session.user.id, groupId)
      if (admin) {
        const maxGroupMembers = await isMaxGroupMembers(groupId, prisma)
        if (maxGroupMembers)
          return res.status(400).json({ error: "max member count reached" })

        const { userId } = req.body
        try {
          const [user, userRequest] = await prisma.$transaction([
            prisma.stat.create({
              data: {
                userId,
                groupId,
              },
            }),
            prisma.groupRequests.delete({
              where: {
                userId_groupId: {
                  userId,
                  groupId,
                },
              },
            }),
          ])
          if (user && userRequest)
            return res.status(201).json({ message: "user approved" })
        } catch (error) {
          return res.status(500).json(error)
        }
      } else return res.status(403).json({ message: "unauthorized" })
    }
  }
  return res.status(405)
}

export default handler
