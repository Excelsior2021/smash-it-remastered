import userStore from "@/src/store/user"
import routes from "@/src/lib/client-routes"
import Image from "next/image"
import Link from "next/link"
import BackButton from "../svg/back-button"
import { useRouter } from "next/router"
import { useSession } from "next-auth/react"
import headerStore from "@/src/store/header"

const Header = () => {
  const session = useSession()
  const router = useRouter()
  const activeGroup = userStore(state => state.activeGroup)
  const backRoute = headerStore(state => state.backRoute)

  return (
    <header className="flex flex-col items-center p-4 relative">
      {session.status === "authenticated" && backRoute && (
        <div
          className="absolute left-[24px] top-[24px] cursor-pointer lg:left-[40px]"
          onClick={() => router.push(backRoute)}>
          <BackButton className="w-8 h-8 min-[380px]:w-10 min-[380px]:h-10" />
        </div>
      )}
      <div className="relative w-48 h-12">
        <Link href={routes.root}>
          <Image src="/logo.png" alt="logo" fill />
        </Link>
      </div>
      {activeGroup && (
        <div className="text-3xl text-center capitalize">
          {activeGroup.name}
        </div>
      )}
    </header>
  )
}

export default Header
