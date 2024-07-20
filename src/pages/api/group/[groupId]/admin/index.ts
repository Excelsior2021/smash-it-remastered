//lib
import { isAdmin } from "@/src/lib/server-validation"
import prisma from "@/src/lib/prisma"
import method from "@/src/enums/http-method"

//next-auth
import { getServerSession } from "next-auth"
import { authOptions } from "../../../auth/[...nextauth]"

import type { NextApiRequest, NextApiResponse } from "next"

//admin authorization required

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ message: "not authenticated" })

  const groupId = parseInt(req.query.groupId as string)
  const admin = await isAdmin(prisma, session.user.id, groupId)

  if (!admin) return res.status(401).json({ message: "unauthorized" })

  switch (req.method) {
    case method.patch: {
      try {
        const { userId } = req.body

        const stat = await prisma.stat.update({
          where: {
            userId_groupId: {
              userId,
              groupId,
            },
          },
          data: {
            isAdmin: true,
          },
        })

        if (stat) return res.status(200).json({ message: `user now admin` })
        else return res.status(500)
      } catch (error) {
        console.log(error)
      }
    }
  }
  return res.status(405)
}

export default handler
