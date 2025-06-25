import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar'; // Assuming a generic Navbar

export default function ResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (router.isReady) {
      const { token: queryToken } = router.query;
      if (queryToken) {
        setToken(queryToken);
      } else {
        setError('No reset token provided or token is invalid. Please request a new password reset.');
      }
    }
  }, [router.isReady, router.query]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    if (!token) {
      setError('Password reset token is missing. Please try the reset link again.');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) { // Basic password length validation
        setError('Password must be at least 6 characters long.');
        setIsLoading(false);
        return;
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        setIsSuccess(true);
        setPassword('');
        setConfirmPassword('');
      } else {
        setError(data.message || 'Failed to reset password.');
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!router.isReady && !token && !error) {
    return (
        <>
        <Navbar />
        <div className="container mt-5 text-center">
            <p>Loading...</p>
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
        </>
    );
  }


  return (
    <>
      <Head>
        <title>Reset Password</title>
      </Head>
      <Navbar />
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card shadow-lg">
              <div className="card-body p-4">
                <h1 className="card-title text-center mb-4">Reset Password</h1>

                {isSuccess ? (
                  <div className="alert alert-success text-center">
                    <p>{message}</p>
                    <Link href="/login" legacyBehavior><a>Proceed to Login</a></Link>
                  </div>
                ) : (
                  <>
                    {error && <div className="alert alert-danger">{error}</div>}
                    {message && <div className="alert alert-info">{message}</div>}

                    {!token && !error && <p className="text-center">Loading token...</p>}

                    {token && (
                      <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                          <label htmlFor="passwordInput" className="form-label">New Password</label>
                          <input
                            type="password"
                            className="form-control"
                            id="passwordInput"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isLoading}
                          />
                        </div>
                        <div className="mb-3">
                          <label htmlFor="confirmPasswordInput" className="form-label">Confirm New Password</label>
                          <input
                            type="password"
                            className="form-control"
                            id="confirmPasswordInput"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            disabled={isLoading}
                          />
                        </div>
                        <div className="d-grid">
                          <button type="submit" className="btn btn-primary" disabled={isLoading}>
                            {isLoading ? (
                              <>
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                {' '}Processing...
                              </>
                            ) : (
                              'Reset Password'
                            )}
                          </button>
                        </div>
                      </form>
                    )}
                  </>
                )}
                 {!isSuccess && !token && error && (
                    <div className="text-center mt-3">
                        <Link href="/login" legacyBehavior><a>Back to Login</a></Link>
                        {' | '}
                        <Link href="/forgot-password" legacyBehavior><a>Request new link</a></Link>
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
