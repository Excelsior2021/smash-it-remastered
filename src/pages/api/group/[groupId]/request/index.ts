import { getServerSession } from "next-auth"
import { authOptions } from "../../../auth/[...nextauth]"
import prisma from "@/src/lib/prisma"
import { isMaxUserGroups } from "@/src/lib/server-validation"
import method from "@/src/lib/http-method"

import type { NextApiRequest, NextApiResponse } from "next"

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions)

  if (!session) return res.status(401).json("not authenticated")

  switch (req.method) {
    case method.post: {
      const { userId } = req.body
      const maxUserGroups = await isMaxUserGroups(userId, prisma)
      if (maxUserGroups) return res.status(400).json("max group count reached")
      const groupId = parseInt(req.query.groupId as string)
      try {
        const groupRequests = await prisma.groupRequests.create({
          data: {
            userId,
            groupId,
          },
        })
        if (groupRequests) return res.status(201).json("success")
      } catch (error) {
        console.log(error)
      }
    }
  }

  return res.status(405)
}

export default handler
