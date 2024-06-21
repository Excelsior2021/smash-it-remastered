import "../styles/globals.css"
import "../styles/oauth-providers.css"
import Header from "../components/header/header"
import Nav from "../components/nav/nav"
import Providers from "../components/providers/providers"
import Head from "next/head"
import { useState } from "react"
import Router from "next/router"

import type { AppProps } from "next/app"

const App = ({ Component, pageProps }: AppProps) => {
  const [loading, setLoading] = useState(false)

  Router.events.on("routeChangeStart", () => setLoading(true))

  Router.events.on("routeChangeComplete", () => setLoading(false))

  Router.events.on("routeChangeError", () => setLoading(false))

  return (
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
              {loading ? (
                <div className="flex justify-center h-96">
                  <span className="loading loading-bars loading-lg"></span>
                </div>
              ) : (
                <Component {...pageProps} />
              )}
            </main>
          </div>
        </div>
      </Providers>
    </>
  )
}

export default App
