import { getServerSession } from "next-auth"
import { authOptions } from "../../../auth/[...nextauth]"
import { isAdmin } from "@/lib/server-validation"
import prisma from "@/lib/prisma"
import { method } from "@/enums"

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
      const { userId } = req.body
      try {
        const user = await prisma.groupRequests.delete({
          where: {
            userId_groupId: {
              userId,
              groupId,
            },
          },
        })
        if (user)
          return res.status(200).json({ message: "user declined successfully" })
      } catch (error) {
        console.log(error)
      }
    }
  }

  return res.status(405)
}

export default handler
