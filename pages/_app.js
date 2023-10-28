import '../styles/global.css';
import Head from 'next/head';

export default function App({ Component, pageProps }) {

  return (
    <>
      <Head>
          <title>Websocket chat</title>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>
      <Component {...pageProps} />
    </>
  )
}
