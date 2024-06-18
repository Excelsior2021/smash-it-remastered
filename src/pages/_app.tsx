import "../styles/globals.css"
import "../styles/oauth-providers.css"
import Header from "../components/header/header"
import Nav from "../components/nav/nav"
import Providers from "../components/providers/providers"
import Head from "next/head"

import type { AppProps } from "next/app"

const App = ({ Component, pageProps }: AppProps) => (
  <>
    <Head>
      <title>Smash It! Performance tracking for table tennis</title>
    </Head>
    <Providers>
      <div className="relative flex">
        <Nav />
        <div className="w-full overflow-hidden max-w-[1536px] mx-auto">
          <Header />
          <main className="p-6 mb-16 lg:px-12 lg:mb-0">
            <Component {...pageProps} />
          </main>
        </div>
      </div>
    </Providers>
  </>
)

export default App
