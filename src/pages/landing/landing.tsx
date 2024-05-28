import clientRoute from "@/src/lib/client-route"
import LinkButton from "../../components/link-button/link-button"

const links = [
  {
    name: "login",
    route: clientRoute.login,
  },
  {
    name: "create account",
    route: clientRoute.createAccount,
  },
]

const LandingPage = () => (
  <div>
    <div>
      <div className="hero mb-6">
        <div className="hero-content flex-col gap-12">
          <h1 className="text-3xl text-center">
            Performance tracking for table tennis.
          </h1>

          <ul className="flex flex-col gap-4 text-center">
            <li>Join groups and measure performance against members.</li>
            <li>Keep track of scores.</li>
            <li>Compare your stats with other users.</li>
          </ul>
        </div>
      </div>

      <div className="flex flex-col gap-8  sm:items-center">
        {links.map(({ name, route }) => (
          <LinkButton key={name} href={route} text={name} />
        ))}
      </div>
    </div>
  </div>
)

export default LandingPage
