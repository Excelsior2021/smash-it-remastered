import type { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../auth/[...nextauth]"
import { isAdmin } from "@/src/lib/server-validation"
import prisma from "@/src/lib/prisma"

//admin authorization required

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions)

  if (!session) return res.status(401).json("not authenticated")

  const groupId = parseInt(req.query.groupId as string)
  const admin = await isAdmin(prisma, session.user.id, groupId)

  if (!admin) return res.status(401).json("unauthorized")

  switch (req.method) {
    case "POST": {
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
        if (user) return res.status(200).json("user declined successfully")
      } catch (error) {
        console.log(error)
      }
    }
  }

  return res.status(405)
}

export default handler
