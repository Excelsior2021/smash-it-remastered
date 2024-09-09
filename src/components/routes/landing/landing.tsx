//components
import LinkButton from "../../link-button/link-button"

//lib
import { clientRoute } from "@/enums"

const LandingPage = () => {
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

  const features = [
    "Join groups and track performance.",
    "Keep track of scores and matches.",
    "Compare your stats with other group members.",
  ]

  return (
    <>
      <div className="hero mb-6">
        <div className="hero-content flex-col gap-12">
          <h1 className="text-3xl text-center">
            Performance tracking for table tennis.
          </h1>

          <ul className="flex flex-col gap-4 text-center">
            {features.map(feature => (
              <li key={feature} className="text-xl">
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-col gap-8 max-w-[300px] m-auto">
        {links.map(({ name, route }) => (
          <LinkButton key={name} href={route} text={name} />
        ))}
      </div>
      <p className="text-center m-12">
        Please Note: This app is in beta. There maybe unexpected changes and
        data integrity is not guaranteed. Please keep this in mind while using
        the app.
      </p>
    </>
  )
}
export default LandingPage
