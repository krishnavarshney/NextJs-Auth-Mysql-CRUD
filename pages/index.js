import Link from 'next/link';
import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>Welcome to Next-App-Login</title>
        <meta name="description" content="A Next.js application with user authentication features." />
      </Head>
      <div className="container mt-5 p-5 rounded shadow-lg text-center bg-light">
        <h1 className="display-4 mb-4">Welcome to Our Application!</h1>
        <p className="lead mb-4">
          This is a demonstration of a Next.js application featuring robust user authentication,
          profile management, and more. Join us to experience seamless and secure access.
        </p>
        <hr className="my-4" />
        <p className="mb-4">
          Explore our features, manage your profile, and enjoy a personalized experience.
        </p>
        <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
          <Link href="/signup" legacyBehavior>
            <a className="btn btn-primary btn-lg px-4 gap-3">Sign Up</a>
          </Link>
          <Link href="/login" legacyBehavior>
            <a className="btn btn-outline-secondary btn-lg px-4">Login</a>
          </Link>
        </div>
      </div>
    </>
  );
}
