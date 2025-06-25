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

  // State for Edit User Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null); // User object being edited
  const [editFormData, setEditFormData] = useState({ name: '', email: '', role: '', password: '' });
  const [editError, setEditError] = useState('');
  const [editMessage, setEditMessage] = useState('');
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);


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

  const handleOpenEditModal = (userToEdit) => {
    setEditingUser(userToEdit);
    setEditFormData({
      name: userToEdit.name,
      email: userToEdit.email,
      role: userToEdit.role,
      password: '' // Clear password field each time
    });
    setEditError('');
    setEditMessage('');
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingUser(null);
    setEditFormData({ name: '', email: '', role: '', password: '' });
    setEditError('');
    setEditMessage('');
  };

  const handleEditFormChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    setEditError('');
    setEditMessage('');
    setIsSubmittingEdit(true);

    // Construct payload, only include fields that have values
    const payload = {};
    if (editFormData.name && editFormData.name !== editingUser.name) payload.name = editFormData.name;
    if (editFormData.email && editFormData.email !== editingUser.email) payload.email = editFormData.email;
    if (editFormData.role && editFormData.role !== editingUser.role) payload.role = editFormData.role;
    if (editFormData.password) payload.password = editFormData.password;

    if (Object.keys(payload).length === 0) {
      setEditMessage("No changes detected.");
      setIsSubmittingEdit(false);
      // Optionally close modal after a delay or keep it open
      // setTimeout(handleCloseEditModal, 2000);
      return;
    }

    // Prevent admin from changing their own role if they are the current user
    if (currentUser && currentUser.id === editingUser.id && payload.role && payload.role !== 'admin') {
        setEditError("You cannot change your own role from admin.");
        setIsSubmittingEdit(false);
        return;
    }


    try {
      const res = await fetchWithAuth(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setEditMessage(data.message || 'User updated successfully!');
        // Refresh users list to show changes
        fetchUsers();
        setTimeout(handleCloseEditModal, 1500); // Close modal after a short delay on success
      } else {
        setEditError(data.message || 'Failed to update user.');
      }
    } catch (err) {
      console.error('Failed to update user:', err);
      setEditError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmittingEdit(false);
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
                      className="btn btn-primary btn-sm me-2"
                      onClick={() => handleOpenEditModal(user)}
                      disabled={currentUser && currentUser.id === user.id && user.role === 'admin'} // Prevent self-edit of role if admin
                    >
                      Edit
                    </button>
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

        {/* Edit User Modal (Bootstrap) */}
        {showEditModal && editingUser && (
          <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <form onSubmit={handleUpdateUser}>
                  <div className="modal-header">
                    <h5 className="modal-title">Edit User: {editingUser.name}</h5>
                    <button type="button" className="btn-close" onClick={handleCloseEditModal} disabled={isSubmittingEdit}></button>
                  </div>
                  <div className="modal-body">
                    {editError && <div className="alert alert-danger">{editError}</div>}
                    {editMessage && <div className="alert alert-success">{editMessage}</div>}

                    <div className="mb-3">
                      <label htmlFor="editName" className="form-label">Name</label>
                      <input type="text" className="form-control" id="editName" name="name" value={editFormData.name} onChange={handleEditFormChange} disabled={isSubmittingEdit} />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="editEmail" className="form-label">Email</label>
                      <input type="email" className="form-control" id="editEmail" name="email" value={editFormData.email} onChange={handleEditFormChange} disabled={isSubmittingEdit} />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="editRole" className="form-label">Role</label>
                      <select className="form-select" id="editRole" name="role" value={editFormData.role} onChange={handleEditFormChange}
                        disabled={isSubmittingEdit || (currentUser && currentUser.id === editingUser.id)}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                       {currentUser && currentUser.id === editingUser.id && <small className="form-text text-muted">You cannot change your own role.</small>}
                    </div>
                    <div className="mb-3">
                      <label htmlFor="editPassword" className="form-label">New Password (optional)</label>
                      <input type="password" className="form-control" id="editPassword" name="password" value={editFormData.password} onChange={handleEditFormChange} placeholder="Leave blank to keep current password" disabled={isSubmittingEdit} />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={handleCloseEditModal} disabled={isSubmittingEdit}>Close</button>
                    <button type="submit" className="btn btn-primary" disabled={isSubmittingEdit}>
                      {isSubmittingEdit ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
