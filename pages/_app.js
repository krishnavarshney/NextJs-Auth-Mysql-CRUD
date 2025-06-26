import "bootstrap/dist/css/bootstrap.css";
import "../styles/globals.css";

import { useEffect } from "react";
import { useRouter } from 'next/router';
import { SessionProvider } from "next-auth/react";

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  const router = useRouter();

  useEffect(() => {
    import('bootstrap/dist/js/bootstrap');
  }, []);

  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}

export default MyApp;
