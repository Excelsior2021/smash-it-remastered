import clientRoute from "@/src/lib/client-route"
import LinkButton from "../link-button/link-button"

const NoGroup = () => (
  <div className="flex flex-col justify-center items-center gap-4 mt-[15vh] max-w-[500px] m-auto">
    <p className="text-xl">You aren&apos;t a member of any groups.</p>
    <LinkButton
      href={clientRoute.joinCreateGroup}
      text="join or create a new group"
    />
  </div>
)

export default NoGroup
