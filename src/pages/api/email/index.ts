import VerificationEmailTemplate from "@/src/components/verification-email-template/verification-email-template"
import { Resend } from "resend"

import type { NextApiRequest, NextApiResponse } from "next"

const resend = new Resend(process.env.RESEND_API_KEY)

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { data, error } = await resend.emails.send({
    from: "Acme <onboarding@resend.dev>",
    to: ["temidee11@yahoo.co.uk"],
    subject: "Please verify your account",
    text: "hello world",
    // react: VerificationEmailTemplate({
    //   username: "excelsior",
    //   confirmationLink: "#",
    // }),
  })

  if (error) {
    return res.status(400).json(error)
  }

  res.status(200).json(data)
}

export default handler
