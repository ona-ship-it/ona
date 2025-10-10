import '../styles/globals.css';
import Head from 'next/head';
import type { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>ONAGUI - Your Best Chance To Win</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Statistically ONAGUI Is Your Best Chance To Win" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;