//third party
import { v4 as uuid } from "uuid"

//lib
import method from "@/src/enums/http-method"
import prisma from "@/src/lib/prisma"
import resend, { resendType } from "@/src/lib/resend"
import {
  generateToken,
  sendEmailVerificationToken,
  sendResetPasswordToken,
} from "@/src/lib/auth"

//next-auth
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]"

import type { NextApiRequest, NextApiResponse } from "next"

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    //verify email
    case method.get: {
      try {
        const session = await getServerSession(req, res, authOptions)

        if (!session)
          return res.status(401).json({ message: "not authenticaticated" })

        const emailSent = await prisma.$transaction(async tx => {
          const verificationToken = await generateToken(
            session.user.email,
            uuid,
            tx,
            resendType.emailVerification
          )

          const emailSent = await sendEmailVerificationToken(
            verificationToken.email,
            verificationToken.token,
            session.user.username,
            resend
          )

          return emailSent
        })

        if (!emailSent)
          return res
            .status(500)
            .json({ error: "an error occured. please try again." })
        return res.status(200).json({ message: "verification email sent." })
      } catch (error) {
        console.log(error)
      }
    }
    //reset password
    case method.post: {
      try {
        const { email } = req.body

        const emailExists = await prisma.user.findUnique({
          where: {
            email,
          },
          select: {
            email: true,
            username: true,
          },
        })

        if (!emailExists)
          return res.status(404).json({ error: "email not found" })

        const emailSent = await prisma.$transaction(async tx => {
          const resetPasswordToken = await generateToken(
            emailExists.email,
            uuid,
            tx,
            resendType.resetPassword
          )

          const emailSent = await sendResetPasswordToken(
            resetPasswordToken.email,
            resetPasswordToken.token,
            emailExists.username,
            resend
          )

          return emailSent
        })

        if (!emailSent)
          return res
            .status(500)
            .json({ error: "an error occured. please try again." })
        return res.status(200).json({ message: "reset password email sent." })
      } catch (error) {}
    }
  }
  return res.status(405)
}

export default handler
