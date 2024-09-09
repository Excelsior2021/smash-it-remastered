import "../styles/globals.css"
import "../styles/oauth-providers.css"
import Header from "../components/header/header"
import NavWrapper from "../components/nav-wrapper/nav-wrapper"

import Providers from "../components/providers/providers"
import Head from "next/head"
import { type ReactElement, type ReactNode, useState } from "react"
import Router from "next/router"
import navItems from "../lib/nav-items"

import type { AppProps } from "next/app"
import type { NextPage } from "next"

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

const App = ({ Component, pageProps }: AppPropsWithLayout) => {
  const [loading, setLoading] = useState(false)

  Router.events.on("routeChangeStart", () => setLoading(true))

  Router.events.on("routeChangeComplete", () => setLoading(false))

  Router.events.on("routeChangeError", () => setLoading(false))

  const getLayout = Component.getLayout ?? (page => page)

  return (
    <>
      <Head>
        <title>Smash It! Performance tracking for table tennis</title>
      </Head>
      <Providers>
        <div className="relative flex">
          <NavWrapper navItems={navItems} />
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
