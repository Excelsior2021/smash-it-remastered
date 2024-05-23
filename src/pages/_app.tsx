import "../styles/globals.css"
import Header from "../components/header/header"
import Nav from "../components/nav/nav"
import Providers from "../components/providers/providers"

import type { AppProps } from "next/app"
import Head from "next/head"

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <Providers>
      <Head>
        <title>Smash It!</title>
      </Head>
      <div className="flex">
        <Nav />
        <div className="w-full overflow-hidden max-w-[1536px] mx-auto">
          <Header />
          <main className="p-6 mb-16 lg:px-12 lg:mb-0">
            <Component {...pageProps} />
          </main>
        </div>
      </div>
    </Providers>
  )
}
export default App
