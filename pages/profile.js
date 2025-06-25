import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from 'next/head';
import Navbar from '../components/Navbar'; // Use the shared Navbar

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // For profile picture update
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');
  const [isUpdatingPicture, setIsUpdatingPicture] = useState(false);

  // For email change
  const [newEmail, setNewEmail] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isRequestingEmailChange, setIsRequestingEmailChange] = useState(false);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }
      try {
        const res = await fetch("/api/auth/check-auth", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setProfilePictureUrl(data.user.profilePictureUrl || ''); // Initialize with current URL
        } else {
          localStorage.removeItem("token");
          router.push("/login");
        }
      } catch (error) {
        console.error("Failed to fetch user data", error);
        localStorage.removeItem("token");
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCurrentUser();
  }, [router]);

  const handleProfilePictureUpdate = async (e) => {
    e.preventDefault();
    setProfileMessage('');
    setProfileError('');
    setIsUpdatingPicture(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch('/api/user/upload-profile-picture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ imageUrl: profilePictureUrl }),
      });
      const data = await res.json();
      if (res.ok) {
        setProfileMessage(data.message);
        // Update user state locally if needed, or rely on next check-auth call
        setUser(prevUser => ({ ...prevUser, profilePictureUrl: data.imageUrl }));
      } else {
        setProfileError(data.message || 'Failed to update profile picture.');
      }
    } catch (err) {
      console.error(err);
      setProfileError('An unexpected error occurred.');
    } finally {
      setIsUpdatingPicture(false);
    }
  };

  const handleRequestEmailChange = async (e) => {
    e.preventDefault();
    setEmailMessage('');
    setEmailError('');
    setIsRequestingEmailChange(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch('/api/user/request-email-change', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ newEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        setEmailMessage(data.message);
        setNewEmail(''); // Clear input field
      } else {
        setEmailError(data.message || 'Failed to request email change.');
      }
    } catch (err) {
      console.error(err);
      setEmailError('An unexpected error occurred.');
    } finally {
      setIsRequestingEmailChange(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="container mt-5 text-center">
          <p>Loading profile...</p>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </>
    );
  }

  if (!user) {
    // Should have been redirected by useEffect, but as a fallback
    return (
        <>
            <Navbar />
            <div className="container mt-5"><p>User not found. Please log in.</p></div>
        </>
    );
  }

  return (
    <>
      <Head>
        <title>My Profile - {user.name}</title>
      </Head>
      <Navbar />
      <div className="container mt-5">
        <h1 className="mb-4">My Profile</h1>

        <div className="row">
          {/* Profile Picture Section */}
          <div className="col-md-6 mb-4">
            <div className="card shadow">
              <div className="card-body">
                <h2 className="card-title h5">Profile Picture</h2>
                <div className="mb-3 text-center">
                  {user.profilePictureUrl ? (
                    <img
                      src={user.profilePictureUrl}
                      alt="Profile"
                      className="img-thumbnail rounded-circle"
                      style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      className="bg-secondary rounded-circle d-flex align-items-center justify-content-center"
                      style={{ width: '150px', height: '150px', color: 'white', fontSize: '50px' }}
                    >
                      {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                    </div>
                  )}
                </div>
                {profileMessage && <div className="alert alert-success">{profileMessage}</div>}
                {profileError && <div className="alert alert-danger">{profileError}</div>}
                <form onSubmit={handleProfilePictureUpdate}>
                  <div className="mb-3">
                    <label htmlFor="profilePictureUrlInput" className="form-label">New Profile Picture URL</label>
                    <input
                      type="url"
                      className="form-control"
                      id="profilePictureUrlInput"
                      value={profilePictureUrl}
                      onChange={(e) => setProfilePictureUrl(e.target.value)}
                      placeholder="https://example.com/image.png"
                      disabled={isUpdatingPicture}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={isUpdatingPicture}>
                    {isUpdatingPicture ? 'Updating...' : 'Update Picture'}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Email Management Section */}
          <div className="col-md-6 mb-4">
            <div className="card shadow">
              <div className="card-body">
                <h2 className="card-title h5">Manage Email</h2>
                <p><strong>Current Email:</strong> {user.email}</p>
                {emailMessage && <div className="alert alert-success">{emailMessage}</div>}
                {emailError && <div className="alert alert-danger">{emailError}</div>}
                <form onSubmit={handleRequestEmailChange}>
                  <div className="mb-3">
                    <label htmlFor="newEmailInput" className="form-label">New Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      id="newEmailInput"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="Enter your new email"
                      disabled={isRequestingEmailChange}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={isRequestingEmailChange}>
                    {isRequestingEmailChange ? 'Sending...' : 'Request Email Change'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Other profile information can be displayed here */}
        <div className="card shadow mb-4">
            <div className="card-body">
                <h2 className="card-title h5">Account Details</h2>
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>User ID:</strong> {user.id}</p>
                <p><strong>Role:</strong> {user.role}</p>
                {/* Add link to change password page if it exists */}
            </div>
        </div>

      </div>
    </>
  );
}
