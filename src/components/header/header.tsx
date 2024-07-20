//component
import BackButton from "../svg/back-button"

//next
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/router"

//lib
import clientRoute from "@/src/enums/client-route"

//store
import headerStore from "@/src/store/header"
import userStore from "@/src/store/user"

const Header = () => {
  const router = useRouter()
  const activeGroup = userStore(state => state.activeGroup)
  const backRoute = headerStore(state => state.backRoute)

  return (
    <header className="flex flex-col items-center p-4 relative">
      {backRoute && (
        <div
          className="absolute left-[24px] top-[24px] cursor-pointer lg:left-[40px]"
          onClick={() => router.push(backRoute)}>
          <BackButton className="w-8 h-8 min-[380px]:w-10 min-[380px]:h-10" />
        </div>
      )}
      <div className="relative flex justify-between items-end w-48 h-12">
        <Link href={clientRoute.root}>
          <Image src="/logo.png" alt="logo" fill />
        </Link>

        <span className="text-xl ml-48">BETA</span>
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
