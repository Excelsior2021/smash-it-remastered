import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]"
import prisma from "@/src/lib/prisma"
import {
  generateEmailVerificationToken,
  hashPassword,
  sendEmailVerificationToken,
} from "@/src/lib/auth"
import method from "@/src/lib/http-method"
import { compare, hash } from "bcryptjs"
import { v4 as uuid } from "uuid"
import { Resend } from "resend"
import {
  validateEmail,
  validateName,
  validatePassword,
  validateUsername,
  verifyPassword,
} from "@/src/lib/server-validation"
import pattern from "@/src/lib/field-validation"
import obscenity from "@/src/lib/obscenity-matcher"

import type { NextApiRequest, NextApiResponse } from "next"

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case method.post: {
      const {
        username,
        email,
        firstName,
        lastName,
        password,
        confirmPassword,
      } = req.body
      try {
        if (!username && !email && !password && !confirmPassword)
          return res
            .status(400)
            .json("please check that all required fields are valid")

        const { passwordMatch, passwordPattern } = validatePassword(
          password,
          confirmPassword,
          pattern
        )

        const { emailAlreadyExists, emailPattern } = await validateEmail(
          email,
          pattern,
          prisma
        )

        const { usernameAlreadyExists, usernameObscene, usernamePattern } =
          await validateUsername(username, pattern, obscenity, prisma)

        let firstNameObscene
        let firstNamePattern

        if (firstName) {
          const { nameObscene, namePattern } = validateName(
            firstName,
            pattern,
            obscenity
          )
          firstNameObscene = nameObscene
          firstNamePattern = namePattern
        } else {
          firstNameObscene = false
          firstNamePattern = true
        }

        let lastNameObscene
        let lastNamePattern

        if (lastName) {
          const { nameObscene, namePattern } = validateName(
            lastName,
            pattern,
            obscenity
          )
          lastNameObscene = nameObscene
          lastNamePattern = namePattern
        } else {
          lastNameObscene = false
          lastNamePattern = true
        }

        if (
          usernameObscene ||
          firstNameObscene ||
          lastNameObscene ||
          !usernamePattern ||
          !emailPattern ||
          !firstNamePattern ||
          !lastNamePattern ||
          !passwordPattern ||
          usernameAlreadyExists ||
          emailAlreadyExists
        ) {
          return res.status(400).json({
            message: "one or more invalid entries",
            errors: {
              username: [
                usernameObscene && "username is inappropiate",
                !usernamePattern && "username is invalid",
                usernameAlreadyExists && "username is already taken",
              ],
              email: [
                !emailPattern && "please provide a valid email address",
                emailAlreadyExists && "email address already used",
              ],
              password: [!passwordPattern && "please provide a valid password"],
              confirmPassword: [!passwordMatch && "passwords don't match"],
              firstName: [
                firstNameObscene && "name is inappropiate",
                !firstNamePattern && "name can have a max. of 25 characters",
              ],
              lastName: [
                lastNameObscene && "name is inappropiate",
                !lastNamePattern && "name can have a max. of 25 characters",
              ],
            },
          })
        }

        const resend = new Resend(process.env.RESEND_API_KEY)

        const user = await prisma.$transaction(async tx => {
          const user = await tx.user.create({
            data: {
              username,
              email,
              firstName,
              lastName,
              password: await hashPassword(password, hash),
            },
          })

          const verificationToken = await generateEmailVerificationToken(
            email,
            uuid,
            tx
          )

          const emailSent = await sendEmailVerificationToken(
            verificationToken.email,
            verificationToken.token,
            username,
            resend
          )

          if (!emailSent.id) throw new Error("email not sent")

          return user
        })

        if (user)
          return res.status(201).json({
            message: `account created for ${user.username}`,
          })
      } catch (error) {
        console.log(error)
      }
    }

    case method.patch: {
      try {
        //auth required
        const session = await getServerSession(req, res, authOptions)
        if (!session)
          return res.status(401).json({ message: "not authenticaticated" })

        const {
          email,
          username,
          firstName,
          lastName,
          currentPassword,
          newPassword,
          confirmNewPassword,
        } = req.body

        const passwordData =
          currentPassword && newPassword && confirmNewPassword

        if (!email && !username && !firstName && !lastName && !passwordData)
          return res
            .status(400)
            .json({ message: "no inputs(s) provided or incomplete fields" })

        if (email) {
          const { emailAlreadyExists, emailPattern } = await validateEmail(
            email,
            pattern,
            prisma
          )
          if (emailAlreadyExists || !emailPattern)
            return res.status(400).json({
              message: "email is not valid",
              errors: [
                !emailPattern && "please provide a valid email address",
                emailAlreadyExists && "email address already used",
              ],
            })

          //send verification email
        } else if (username) {
          const { usernameAlreadyExists, usernamePattern, usernameObscene } =
            await validateUsername(username, pattern, obscenity, prisma)
          if (usernameAlreadyExists || !usernamePattern || usernameObscene)
            return res.status(400).json({
              message: "username error",
              errors: [
                usernameObscene && "username is inappropiate",
                !usernamePattern && "username is invalid",
                usernameAlreadyExists && "username is already taken",
              ],
            })

          const user = await prisma.user.update({
            where: {
              id: session.user.id,
            },
            data: {
              username,
            },
            select: {
              username: true,
            },
          })

          if (user)
            return res.status(200).json({
              message: "username updated",
              field: "username",
              value: user.username,
            })
        } else if (firstName || lastName) {
          const name = firstName ? firstName : lastName

          const { nameObscene, namePattern } = validateName(
            name,
            pattern,
            obscenity
          )
          if (nameObscene || !namePattern)
            return res.status(400).json({
              message: "name is not valid",
              errors: [
                nameObscene && "name is inappropiate",
                !namePattern && "name can have a max. of 25 characters",
              ],
            })

          let user
          if (firstName)
            user = await prisma.user.update({
              where: {
                id: session.user.id,
              },
              data: {
                firstName,
              },
              select: {
                firstName: true,
              },
            })
          else if (lastName)
            user = await prisma.user.update({
              where: {
                id: session.user.id,
              },
              data: {
                lastName,
              },
              select: {
                lastName: true,
              },
            })

          if (user)
            return res.status(200).json({
              message: `${firstName ? "first" : "last"} name updated`,
              value: firstName ? user.firstName : user.lastName,
              field: firstName ? "firstName" : "lastName",
            })
        } else if (passwordData) {
          const user = await prisma.user.findUnique({
            where: {
              id: session.user.id,
            },
            select: {
              password: true,
            },
          })

          if (user) {
            const passwordVerified = await verifyPassword(
              currentPassword,
              user.password,
              compare
            )

            const { passwordMatch, passwordPattern } = validatePassword(
              newPassword,
              confirmNewPassword,
              pattern
            )

            if (!passwordVerified)
              return res.status(403).json({
                message: "password is incorrect",
                field: "currentPassword",
                error: "password is incorrect",
              })

            if (!passwordMatch || !passwordPattern)
              return res.status(400).json({
                message: "invalid input(s) for new password",
                errors: {
                  newPassword: !passwordPattern && "password is invalid",
                  confirmNewPassword:
                    !passwordMatch && "passwords do not match",
                },
              })

            const changePassword = await prisma.user.update({
              where: {
                id: session.user.id,
              },
              data: {
                password: await hashPassword(newPassword, hash),
              },
            })

            if (changePassword)
              return res.status(200).json({
                message: "password changed successfully",
              })
          }
        } else return res.status(401).json({ message: "not authenticaticated" })
      } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "error occured", error: error })
      }
    }

    case method.delete: {
      try {
        //auth required
        const session = await getServerSession(req, res, authOptions)
        if (!session)
          return res.status(401).json({ message: "not authenticaticated" })
        const user = await prisma.user.delete({
          where: {
            id: session.user.id,
          },
        })
        if (user) return res.status(204).json("account deleted")
      } catch (error) {
        console.log(error)
        return error
      }
    }
  }
  return res.status(405)
}

export default handler
