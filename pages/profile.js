import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();
  const [users, setUsers] = useState(null);
  const [user, setUser] = useState({ name: "", email: "" });
  const [cust, setCust] = useState({ name: "", email: "" }); //used for preventing null values on name and email

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          // Redirect to the login page if token is not found
          router.push("/login");
        } else {
          const response = await fetch("/api/auth/check-auth", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await response.json();

          if (!response.ok) {
            // Redirect to the login page if the token is invalid
            router.push("/login");
          } else {
            // Set the user data
            setUser(data.user);
          }
        }
      } catch (error) {
        console.error("An error occurred:", error);
      }
    };

    checkAuthentication();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/auth/users");
        const data = await response.json();
        setUsers(data.users);
      } catch (error) {
        console.error("An error occurred:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        // Clear token and redirect to the login page
        localStorage.removeItem("token");
        router.push("/login");
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  const handleProfileUpdate = async () => {
    try {
        const response = await fetch("/api/auth/update-profile", {
            method: "POST",
            headers: { "Content-Type": "application/json",},body: JSON.stringify({
                    name: "John Doe",
                    email: "tugrp@example.com",
                    password: "password",
                    })
                    });
    }
    catch (error) {
        console.error("An error occurred:", error);
        }
  }

  const handleEdit = (userId) => {
    const { id } = userId;
    router.push(`/edit-user/${id}`);
  };
  

  const handleDelete = async (userId) => {
    try {
      const response = await fetch(`/api/auth/${userId}`, {
        method: 'DELETE',
      });
      const delUser = await response.json();
      if (response.ok) {
        console.log("User Deleted")
        router.reload();
        // User deleted successfully, you can perform any necessary actions (e.g., refetch user list)
      } else {
        console.error('Delete failed');
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };
  

  return (
    <div className="container">
      <nav className="navbar navbar-expand-lg navbar-dark sticky-top">
        <div className="container">
          <Link href="/dashboard">
            <div className="navbar-brand">Home</div>
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNavDropdown"
            aria-controls="navbarNavDropdown"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div
            className="collapse navbar-collapse justify-content-end"
            id="navbarNavDropdown"
          >
            <ul className="navbar-nav">
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  id="profileDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
                    fill="currentColor"
                    className="bi bi-person-fill"
                    viewBox="0 0 16 16"
                  >
                    <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3Zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                  </svg>
                </a>
                <ul
                  className="dropdown-menu dropdown-menu-end"
                  aria-labelledby="profileDropdown"
                >
                  <li>
                    <a
                      className="dropdown-item btn"
                      href="#"
                      onClick={handleLogout}
                    >
                      Logout
                    </a>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <div className="container mt-5">
  <h2 className="mb-3">View Users</h2>
  {users ? (
    <div className="table-responsive">
    <table className="table table-dark table-hover">
        <caption>List of users</caption>
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Email</th>
          <th>Edit</th>
          <th>Delete</th>
        </tr>
      </thead>
      <tbody>
        {users.map((users) => (
          <tr key={users.id}>
            <td>{users.id}</td>
            <td>{users.name}</td>
            <td>{users.email}</td>
            <td>
                <a className="btn link-light" data-bs-toggle="tooltip" data-bs-placement="top" title="Edit" onClick={() => handleEdit(users)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-pencil-square" viewBox="0 0 16 16">
                        <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                        <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
                    </svg>
                </a>
            </td>
            <td>
                <a className="btn link-light" data-bs-toggle="modal" data-bs-target="#staticBackdrop" title="Delete" onClick={() => handleDelete(users.id)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-trash3" viewBox="0 0 16 16">
                        <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11Zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5h9.916Zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47ZM8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5Z"/>
                    </svg>
                </a>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    </div>
  ) : (
    <p>Loading users...</p>
  )}
</div>
<div
        className="modal fade"
        id="staticBackdrop"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex="-1"
        aria-labelledby="staticBackdropLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog text-black">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="staticBackdropLabel">
                Delete User
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">Are You Sure to want to Delete user ?</div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-dark"
                data-bs-dismiss="modal"
              >
                No
              </button>
              <button type="button" className="btn btn-primary">
                Yes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
