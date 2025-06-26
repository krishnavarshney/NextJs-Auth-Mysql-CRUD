import Link from "next/link";
import Image from "next/image"; // Not used, can be removed
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { signIn, useSession } from "next-auth/react";
import Head from "next/head"; // Good practice for page titles

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [apiResponse, setApiResponse] = useState(null); // For credentials login errors
  const [isCredentialsLoading, setIsCredentialsLoading] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      // If user is already authenticated (e.g., via NextAuth session), redirect to dashboard
      router.push(router.query.callbackUrl || "/dashboard");
    }
    // The old checkAuthentication logic based on localStorage token is removed
    // as NextAuth session will be the primary source of truth for auth state.
  }, [status, router]);

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setIsCredentialsLoading(true);
    setApiResponse(null); // Clear previous errors

    // This is for your existing custom credentials login.
    // If you migrate credentials login to NextAuth's CredentialsProvider, this will change.
    try {
      const res = await fetch("/api/auth/login", { // Your existing login API
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem("token", data.token); // Still using localStorage for your custom JWT
        // To integrate with NextAuth session immediately after custom login,
        // you might need to call signIn() here with a custom credentials provider
        // or manually trigger a session update if possible.
        // For now, just redirecting.
        router.push(router.query.callbackUrl || "/dashboard");
      } else {
        setApiResponse(data.message || "Login failed.");
      }
    } catch (error) {
      setApiResponse("Server error during login.");
    } finally {
      setIsCredentialsLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    // Optionally, include a callbackUrl or redirect: false if you want to handle errors here
    const result = await signIn(provider, {
        callbackUrl: router.query.callbackUrl || "/dashboard",
        // redirect: false // if you want to handle result.error here
    });

    // if (result?.error) {
    //   setApiResponse(result.error); // Show error from NextAuth
    // }
  };


  if (status === "loading") {
    return (
        <div className="container text-center mt-5">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading session...</span>
            </div>
        </div>
    );
  }

  // If already authenticated, useEffect will redirect.
  // This prevents rendering the login form if already logged in.
  if (session) {
    return null;
  }

  return (
    <>
    <Head>
        <title>Login</title>
    </Head>
    <div className="container vh-100 d-flex align-items-center justify-content-center">
      <div className="col-md-6 col-lg-4">
        <div className="card shadow-lg">
          <div className="card-body p-4 p-md-5">
            <h1 className="card-title text-center mb-4 fs-3">Login</h1>
            {apiResponse && (
                <div className="alert alert-danger text-center p-2" role="alert">
                  {apiResponse}
                </div>
              )}
              <div className="mb-3">
                <input
                  type="email"
                  className="form-control p-3 fs-5 bg-transparent text-white"
                  id="email"
                  placeholder="Enter Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <div className="invalid-feedback">{}</div>
              </div>
              <div className="mb-3">
                <input
                  type="password"
                  className="form-control p-3 fs-5 bg-transparent text-white"
                  id="password"
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div className="invalid-feedback">{}</div>
              </div>
              <form onSubmit={handleCredentialsSubmit}>
                <div className="mb-3">
                  <label className="form-label" htmlFor="email">Email address</label>
                  <input
                    type="email"
                    className="form-control form-control-lg"
                    id="email"
                    placeholder="Enter Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isCredentialsLoading}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="password">Password</label>
                  <input
                    type="password"
                    className="form-control form-control-lg"
                    id="password"
                    placeholder="Enter Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isCredentialsLoading}
                  />
                </div>
                <div className="d-grid mb-3">
                  <button className="btn btn-primary btn-lg" type="submit" disabled={isCredentialsLoading}>
                    {isCredentialsLoading ? (
                        <>
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            {' '}Logging in...
                        </>
                    ) : 'Login'}
                  </button>
                </div>
              </form>

              <div className="text-center my-3">
                <span className="text-muted">OR</span>
              </div>

              <div className="d-grid mb-3">
                <button onClick={() => handleSocialLogin('google')} className="btn btn-danger btn-lg d-flex align-items-center justify-content-center">
                  {/* Basic Google Icon (replace with SVG or Font Awesome if available) */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-google me-2" viewBox="0 0 16 16">
                    <path d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.689 7.689 0 0 1 5.352 2.082l-2.284 2.284A4.347 4.347 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.792 4.792 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.702 3.702 0 0 0 1.599-2.431H8v-3.08h7.545z"/>
                  </svg>
                  Sign in with Google
                </button>
              </div>
              {/* Add GitHub button similarly if configured */}
              {/* <div className="d-grid mb-3">
                <button onClick={() => handleSocialLogin('github')} className="btn btn-dark btn-lg">Sign in with GitHub</button>
              </div> */}

              <div className="text-center mt-3">
                <Link href="/signup" legacyBehavior>
                  <a className="text-muted text-decoration-none me-3">Create an account</a>
                </Link>
                <Link href="/forgot-password" legacyBehavior>
                  <a className="text-muted text-decoration-none">Forgot Password?</a>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
