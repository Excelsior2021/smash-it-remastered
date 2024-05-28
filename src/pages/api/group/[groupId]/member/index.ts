import { getServerSession } from "next-auth"
import { authOptions } from "../../../auth/[...nextauth]"
import { isAdmin } from "@/src/lib/server-validation"
import prisma from "@/src/lib/prisma"
import method from "@/src/lib/http-method"

import type { NextApiRequest, NextApiResponse } from "next"

//admin authorization required

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json("not authenticated")

  const groupId = parseInt(req.query.groupId as string)
  const admin = await isAdmin(prisma, session.user.id, groupId)

  if (!admin) return res.status(401).json("unauthorized")

  switch (req.method) {
    case method.delete: {
      try {
        const { userId } = req.body
        const stats = await prisma.stat.delete({
          where: {
            userId_groupId: {
              userId,
              groupId,
            },
          },
        })

        if (stats) return res.status(200).json("member removed successfully")
        else res.status(404).json("member not found")
      } catch (error) {
        console.log(error)
        res.status(500).json(error)
      }
    }
  }
  return res.status(405)
}

export default handler
