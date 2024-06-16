//next
import Link from "next/link"

type props = {
  href: string
  text: string
}

const LinkButton = ({ href, text }: props) => (
  <Link className="btn btn-secondary rounded-lg w-full" href={href}>
    {text}
  </Link>
)

export default LinkButton
