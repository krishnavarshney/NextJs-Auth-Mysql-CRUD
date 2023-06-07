import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

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

  return (
    <div className="container">
      <nav className="navbar navbar-expand-lg navbar-dark sticky-top">
        <div className="container">
          {user && <a className="navbar-brand">Hello ! {user.name}</a>}
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
                    <Link href="/profile">
                      <div className="dropdown-item">View Profile</div>
                    </Link>
                  </li>
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
      <div className="card text-center bg-transparent p-5 text-white shadow-lg">
        <div className="card-header">Featured</div>
        <div className="card-body">
          <h5 className="card-title">Special title treatment</h5>
          <p className="card-text">
            With supporting text below as a natural lead-in to additional
            content.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            data-bs-toggle="modal"
            data-bs-target="#staticBackdrop"
          >
            Do Something
          </button>
        </div>
        <div className="card-footer text-muted">2 days ago</div>
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
                Modal title
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">...</div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-dark"
                data-bs-dismiss="modal"
              >
                Close
              </button>
              <button type="button" className="btn btn-primary">
                Understood
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
