import { AppProps } from 'next/app';
import Head from 'next/head';
import { ConfigProvider } from 'react-vant';
import './styles.css';

const themes = {
  cellFontSize: 16,
};

function CustomApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>考勤记录</title>
        {/* <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, viewport-fit=cover"
        /> */}
      </Head>
      <main className="app">
        <ConfigProvider themeVars={themes}>
          <Component {...pageProps} />
        </ConfigProvider>
      </main>
    </>
  );
}

export default CustomApp;
