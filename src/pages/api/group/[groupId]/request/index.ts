import { getServerSession } from "next-auth"
import { authOptions } from "../../../auth/[...nextauth]"
import prisma from "@/lib/prisma"
import { isMaxUserGroups } from "@/lib/server-validation"
import method from "@/enums/http-method"

import type { NextApiRequest, NextApiResponse } from "next"

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions)

  if (!session) return res.status(401).json({ message: "not authenticated" })

  switch (req.method) {
    case method.post: {
      const { userId } = req.body
      const maxUserGroups = await isMaxUserGroups(userId, prisma)
      if (maxUserGroups)
        return res.status(400).json({ error: "max group count reached" })
      const groupId = parseInt(req.query.groupId as string)

      try {
        const groupRequest = await prisma.groupRequests.create({
          data: {
            userId,
            groupId,
          },
        })
        console.log(groupRequest)
        if (groupRequest)
          return res
            .status(201)
            .json({ message: "request submitted", groupRequest })
      } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "an error occured" })
      }
    }
  }

  return res.status(405)
}

export default handler
