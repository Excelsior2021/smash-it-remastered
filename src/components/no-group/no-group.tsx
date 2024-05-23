import routes from "@/src/lib/client-routes"
import LinkButton from "../link-button/link-button"

const NoGroup = () => (
  <div className="flex flex-col justify-center items-center gap-4 h-[60vh]">
    <p className="text-xl">You aren&apos;t a member of any groups.</p>
    <LinkButton
      href={routes.joinCreateGroup}
      text="join or create a new group"
    />
  </div>
)

export default NoGroup
