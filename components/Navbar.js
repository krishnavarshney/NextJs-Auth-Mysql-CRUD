import Link from "next/link";
import { useRouter } from "next/router";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isLoading = status === "loading";

  const handleLogout = async () => {
    // If using custom JWT alongside NextAuth, clear that too.
    localStorage.removeItem("token"); // Clear custom JWT if it exists

    // Sign out from NextAuth. It will redirect to the login page or homepage by default.
    // Specify callbackUrl if you want a different redirect.
    await signOut({ callbackUrl: '/login' });
  };

  const user = session?.user; // User object from NextAuth session

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
            {/* Show links based on NextAuth session status */}
            {!isLoading && user && (
              <>
                <li className="nav-item">
                  <Link href="/dashboard" legacyBehavior><a className="nav-link">Dashboard</a></Link>
                </li>
                <li className="nav-item">
                  <Link href="/profile" legacyBehavior><a className="nav-link">Profile</a></Link>
                </li>
                {/* Role is now on session.user.role from NextAuth token */}
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
              <>
                <li className="nav-item dropdown">
                  <a className="nav-link dropdown-toggle" href="#" id="navbarDropdownMenuLink" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    {user.image ? (
                      <img src={user.image} alt={user.name || 'User'} style={{width: '30px', height: '30px', borderRadius: '50%', marginRight: '8px'}} />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" className="bi bi-person-circle me-1" viewBox="0 0 16 16">
                        <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
                        <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"/>
                      </svg>
                    )}
                    {user.name || user.email}
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdownMenuLink">
                    <li><Link href="/profile" legacyBehavior><a className="dropdown-item">Profile</a></Link></li>
                    {user.role === 'admin' && (
                        <li><Link href="/admin/dashboard" legacyBehavior><a className="dropdown-item">Admin Panel</a></Link></li>
                    )}
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                        <button onClick={handleLogout} className="dropdown-item btn btn-link">
                            Logout
                        </button>
                    </li>
                  </ul>
                </li>
              </>
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
