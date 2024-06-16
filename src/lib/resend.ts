import { Resend } from "resend"

const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY)

export enum resendType {
  emailVerification = "emailVerification",
  resetPassword = "resetPassword",
}

export default resend
