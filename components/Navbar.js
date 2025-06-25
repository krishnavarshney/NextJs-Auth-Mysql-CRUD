import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await fetch("/api/auth/check-auth", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (res.ok) {
            const data = await res.json();
            setUser(data.user);
          } else {
            // Token might be invalid or expired
            localStorage.removeItem("token");
            setUser(null);
          }
        } catch (error) {
          console.error("Failed to fetch user", error);
          localStorage.removeItem("token"); // Clear token on error
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };

    fetchUser();

    // Listen to storage events to sync logout across tabs
    const handleStorageChange = (event) => {
      if (event.key === 'token' && event.newValue === null) {
        setUser(null);
        router.push('/login'); // Optional: redirect to login on logout from another tab
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Re-check auth when route changes, if needed, or rely on page-level checks
    // For simplicity, this Navbar primarily relies on initial load and storage events.
    // More complex scenarios might use a global auth context.

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };

  }, [router]); // Added router to dependency array if it's used for reactive changes based on route

  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        localStorage.removeItem("token");
        setUser(null);
        router.push("/login");
      } else {
        console.error("Logout failed:", await res.json());
         // Still attempt to clear client-side session
        localStorage.removeItem("token");
        setUser(null);
        router.push("/login"); // Force redirect even if server logout fails
      }
    } catch (error) {
      console.error("Error during logout:", error);
      localStorage.removeItem("token");
      setUser(null);
      router.push("/login"); // Force redirect
    }
  };

  // Don't render navbar content until loading is finished to prevent flash of incorrect links
  // or render a minimal loading state for Navbar itself if preferred.
  // For now, we let it render and links will adjust once `isLoading` is false.

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
      <div className="container-fluid">
        <Link href="/" legacyBehavior>
          <a className="navbar-brand">MyApp</a>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link href="/" legacyBehavior><a className="nav-link">Home</a></Link>
            </li>
            {!isLoading && user && (
              <>
                <li className="nav-item">
                  <Link href="/dashboard" legacyBehavior><a className="nav-link">Dashboard</a></Link>
                </li>
                <li className="nav-item">
                  <Link href="/profile" legacyBehavior><a className="nav-link">Profile</a></Link>
                </li>
                {user.role === 'admin' && (
                  <li className="nav-item">
                    <Link href="/admin/dashboard" legacyBehavior><a className="nav-link">Admin Panel</a></Link>
                  </li>
                )}
              </>
            )}
          </ul>
          <ul className="navbar-nav">
            {isLoading ? (
              <li className="nav-item">
                <span className="nav-link">Loading...</span>
              </li>
            ) : user ? (
              <li className="nav-item">
                <button onClick={handleLogout} className="btn btn-link nav-link">
                  Logout ({user.name})
                </button>
              </li>
            ) : (
              <>
                <li className="nav-item">
                  <Link href="/login" legacyBehavior><a className="nav-link">Login</a></Link>
                </li>
                <li className="nav-item">
                  <Link href="/signup" legacyBehavior><a className="nav-link">Sign Up</a></Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
