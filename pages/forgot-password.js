import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message); // Generic message: "If your email is in our system..."
        setEmail(''); // Clear email field on success
      } else {
        setError(data.message || 'Failed to process request.');
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Forgot Password</title>
      </Head>
      <Navbar />
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card shadow-lg">
              <div className="card-body p-4">
                <h1 className="card-title text-center mb-4">Forgot Your Password?</h1>
                <p className="text-center text-muted mb-4">
                  No problem. Enter your email address below and we'll send you a link to reset your password.
                </p>

                {error && <div className="alert alert-danger">{error}</div>}
                {message && <div className="alert alert-success">{message}</div>}

                {!message && ( // Hide form after success message
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label htmlFor="emailInput" className="form-label">Email Address</label>
                      <input
                        type="email"
                        className="form-control"
                        id="emailInput"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                        placeholder="Enter your email"
                      />
                    </div>
                    <div className="d-grid">
                      <button type="submit" className="btn btn-primary" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            {' '}Sending Link...
                          </>
                        ) : (
                          'Send Password Reset Link'
                        )}
                      </button>
                    </div>
                  </form>
                )}

                <div className="text-center mt-4">
                  <Link href="/login" legacyBehavior>
                    <a className="text-decoration-none">Back to Login</a>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
