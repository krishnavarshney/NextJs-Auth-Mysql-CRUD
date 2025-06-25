import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar'; // Assuming a generic Navbar

export default function VerifyEmailChangePage() {
  const router = useRouter();
  const [message, setMessage] = useState('Verifying your email change...');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (router.isReady) {
      const { token } = router.query;

      if (!token) {
        setError('No verification token found. Please use the link from your email.');
        setIsLoading(false);
        return;
      }

      const verifyToken = async () => {
        try {
          const res = await fetch('/api/user/verify-email-change', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
          });

          const data = await res.json();

          if (res.ok) {
            setMessage(data.message || 'Email verified successfully! Your email address has been updated.');
            // It's good practice to prompt user to log out and log back in,
            // or handle token re-issuance if JWT contains email.
            // For simplicity, we'll just show a success message.
            // Consider clearing the auth token to force re-login:
            // localStorage.removeItem('token');
          } else {
            setError(data.message || 'Failed to verify email. The link may be invalid or expired.');
          }
        } catch (err) {
          console.error('Verification API error:', err);
          setError('An unexpected error occurred during verification. Please try again later.');
        } finally {
          setIsLoading(false);
        }
      };

      verifyToken();
    }
  }, [router.isReady, router.query]);

  return (
    <>
      <Head>
        <title>Verify Email Change</title>
      </Head>
      <Navbar />
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card shadow-lg text-center">
              <div className="card-body p-5">
                <h1 className="card-title mb-4">Email Change Verification</h1>
                {isLoading ? (
                  <>
                    <p>{message}</p>
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </>
                ) : error ? (
                  <div className="alert alert-danger">
                    <p className="fw-bold">Verification Failed</p>
                    <p>{error}</p>
                    <Link href="/profile" legacyBehavior><a className="btn btn-secondary mt-3 me-2">Go to Profile</a></Link>
                    <Link href="/login" legacyBehavior><a className="btn btn-primary mt-3">Go to Login</a></Link>
                  </div>
                ) : (
                  <div className="alert alert-success">
                    <p className="fw-bold">Verification Successful</p>
                    <p>{message}</p>
                    <p>You may need to log in again to see the changes reflected everywhere.</p>
                    <Link href="/login" legacyBehavior><a className="btn btn-primary mt-3">Proceed to Login</a></Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
