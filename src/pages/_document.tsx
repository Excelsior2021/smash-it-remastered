import { Html, Head, Main, NextScript } from "next/document"

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href="/favicon.png" type="image/x-icon" />
      </Head>
      <body className="bg-[#156596] min-h-[101vh] text-[#f7f3e8] lg:min-h-[100vh]">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
