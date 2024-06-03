import Link from "next/link"

type props = {
  username: string
  confirmationLink: string
}

const VerificationEmailTemplate = ({ username, confirmationLink }: props) => (
  <div>
    <h1>Hi, {username}!</h1>

    <p>Please verify your account with the link below.</p>

    <Link href={confirmationLink}>{confirmationLink}</Link>
  </div>
)

export default VerificationEmailTemplate
