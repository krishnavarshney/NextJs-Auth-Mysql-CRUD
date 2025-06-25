import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Navbar from '../../components/Navbar'; // Assuming Navbar handles auth state

async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem('token'); // Or however token is stored
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
  return fetch(url, { ...options, headers });
}

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null); // To store logged-in user info
  const router = useRouter();

  useEffect(() => {
    // Fetch current user data (including role) to protect the page
    // This relies on an auth check endpoint that returns user role
    const checkUserAuth = async () => {
      try {
        const res = await fetchWithAuth('/api/auth/check-auth');
        if (!res.ok) {
          router.push('/login'); // Redirect if not authenticated
          return;
        }
        const data = await res.json();
        if (data.user && data.user.role === 'admin') {
          setCurrentUser(data.user);
          fetchUsers();
        } else {
          setError('Access Denied: You are not an admin.');
          router.push('/dashboard'); // Redirect non-admins
        }
      } catch (err) {
        console.error('Auth check failed', err);
        setError('Failed to verify authentication.');
        router.push('/login');
      }
    };
    checkUserAuth();
  }, [router]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetchWithAuth('/api/admin/users');
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Error: ${res.status}`);
      }
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      if (currentUser && currentUser.id === userId) {
        alert("You cannot delete your own account from the admin panel.");
        return;
      }
      try {
        const res = await fetchWithAuth(`/api/admin/users/${userId}`, { method: 'DELETE' });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || `Error: ${res.status}`);
        }
        // Refresh users list
        fetchUsers();
      } catch (err) {
        console.error('Failed to delete user:', err);
        setError(err.message);
      }
    }
  };

  if (!currentUser && isLoading) { // Still checking auth or loading initial data
    return (
      <>
        <Navbar />
        <div className="container mt-5 text-center">
          <p>Loading admin dashboard...</p>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </>
    );
  }

  if (error && !users.length) { // Show error if initial loading failed and no users loaded
     return (
      <>
        <Navbar />
        <div className="container mt-5">
          <Head>
            <title>Admin Dashboard - Error</title>
          </Head>
          <h1>Admin Dashboard</h1>
          <p className="text-danger">{error}</p>
        </div>
      </>
    );
  }


  if (currentUser && currentUser.role !== 'admin') { // Should have been redirected, but as a fallback
    return (
        <>
            <Navbar />
            <div className="container mt-5">
                <p>Access Denied. You are not authorized to view this page.</p>
            </div>
        </>
    );
  }


  return (
    <>
      <Head>
        <title>Admin Dashboard</title>
      </Head>
      <Navbar />
      <div className="container mt-5">
        <h1 className="mb-4">Admin Dashboard - User Management</h1>
        {isLoading && !users.length && <p>Loading users...</p>}
        {error && <div className="alert alert-danger" role="alert">{error}</div>}
        {!isLoading && !error && users.length === 0 && <p>No users found.</p>}
        {!isLoading && users.length > 0 && (
          <table className="table table-striped table-hover">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={currentUser && currentUser.id === user.id} // Prevent admin from deleting self
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
